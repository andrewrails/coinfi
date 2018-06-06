/*
 * Selector creators which use the following pattern:
 * 
 * {
 *   newsfeed: {
 *     activeEntity: { id, type },
 *     entityDetails: {
 *       coins: {}
 *     },
 *     entityIDs: {
 *       coinIDs: []
 *       newsItems: [],
 *       tags: []
 *     },
 *     entityList: {
 *       coins: {},
 *       newsItems: {},
 *       tags: {}
 *     }
 *   }
 * }
 */
import { createSelector } from 'reselect'
import { pluralize, singularize } from '../misc'

export default (namespace) => {
  const selectState = (state) => state[namespace]
  return {
    entityIDs: (entityType) =>
      createSelector(selectState, (state) =>
        state.getIn(['entityIDs', entityType])
      ),
    entities: (entityType) =>
      createSelector(selectState, (state) => {
        const ids = state.getIn(['entityIDs', entityType])
        const entities = state.getIn(['entityList', entityType])
        if (!ids || !entities) return []
        return ids.map((id) => entities.get(`${id}`))
      }),
    entityFromList: (entityType) =>
      createSelector(selectState, (state) => (id) =>
        state.getIn(['entityList', entityType, `${id}`])
      ),
    entityChildren: (entityType, childrenType) =>
      createSelector(selectState, (state) => (parent) => {
        const children =
          parent.get(childrenType) ||
          parent.get(`${singularize(childrenType)}_ids`)
        if (!children) return []
        return children
          .map((childID) =>
            state.getIn(['entityList', childrenType, `${childID}`])
          )
          .filter((child) => child)
      }),
    entityDetails: (entityType) =>
      createSelector(selectState, (state) => (id) =>
        state.getIn(['entityDetails', pluralize(entityType), `${id}`])
      ),
    activeEntity: createSelector(selectState, (state) =>
      state.get('activeEntity')
    ),
    isLoading: createSelector(selectState, (state) => (entityType) =>
      [true, undefined].includes(state.getIn(['loadingEntities', entityType]))
    )
  }
}