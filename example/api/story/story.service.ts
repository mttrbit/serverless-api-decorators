import * as Debug from 'debug';
import { endpoint, lambda } from 'sls-api-decorators/decorators';

const debug = Debug('stories-service');

@endpoint({
  name: 'storyService',
  path: 'stories',
  xOrigin: true,
})
class StoryService {
  constructor() {
    debug('Initing StoryService');
    // debug('User Factory', this.User);
  }

  @lambda({
    name: 'list',
    path: '/',
    method: 'get',
    integration: 'lambda',
  })
  public list(event, offset, limit) {
    debug('Running welcome');

    return [{
      id: 1,
      title: 'Il nome della rosa',
      author: 'Umberto Eco',
    }];
  }

  @lambda({
    name: 'getById',
    path: '/{id}',
    method: 'get',
    integration: 'lambda',
  })
  public getById(id) {
    debug('Running get by id:', id);

    return {
      id: 1,
      title: 'Il nome della rosa',
      author: 'Umberto Eco',
    };
  }

  @lambda({
    name: 'getSubscriptions',
    path: '/{id}/subscriptions',
    method: 'get',
    integration: 'lambda',
  })
  public getSubscriptions(id) {
    debug('Running get by id:', id);
    return ['Playboy', 'Penthouse'];
  }

  @lambda({
    name: 'error',
    path: 'error',
    method: 'get',
    integration: 'lambda',
  })
  public error(event) {
    debug('throwing an error');
    throw new Error('something weird just happened');
  }
}

export { StoryService };
