import * as DI from '../../di';

export const api = config => {
  return target => {
    // import
    // target.prototype['factories'] = DI.getFactories();
    target.prototype = {
      // create a new instance of App class and store it in DI for future ref
      DI,
      services: DI.getServices(),
      factories: DI.getFactories(),
    };
    // instantiate Factories and Services
  };
};
