export const ensure = (
  f: ((val: any) => any),
  err: ((val?: any) => any) = key =>
    new Error(`${key} must satisfy precondition.`),
) => (target: object, propertyKey: string) => {
  let val = this[propertyKey];

  const get = () => val;
  const set = newVal => {
    if (f(newVal)) {
      val = newVal;
    } else {
      throw err(propertyKey);
    }
  };

  Object.defineProperty(target, propertyKey, { get, set });
};
