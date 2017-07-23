import * as Debug from 'debug';

const $log = Debug('annotations');

export const entity = (target: any) => {
  $log('running Entity decorator:', target);

  return (...args: any[]) => {
    $log('applying Entity decorator:', args);
  };
};

export const field = (target?: any) => {
  $log('running Field decorator:', target);

  return (...args: any[]) => {
    $log('applying Field decorator:', args);
  };
};
