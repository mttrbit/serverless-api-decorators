import * as Debug from 'debug';
import * as DI from '../../di';

const d = Debug('@Api');

export const api = (config) => {
  return (target) => {
    // import
    d('Running decorator on:', target.prototype, config);

    // target.prototype['factories'] = DI.getFactories();
    target.prototype = {
      // create a new instance of App class and store it in DI for future ref
      DI,
      services: DI.getServices(),
    };

    d('app prototype:', target.prototype);
    // instantiate Factories and Services
  };
};
