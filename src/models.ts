import * as Debug from 'debug';

const $log = Debug('annotations');

export const entity = (target) => {
  $log('running Entity decorator:', target);

  return (...args: any[]) => {
    $log('applying Entity decorator:', args);
  };
};

export const field = (target) => {
  $log('running Field decorator:', target);

  return (...args: any[]) => {
    $log('applying Field decorator:', args);
  };
};
