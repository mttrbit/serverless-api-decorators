export const ensure = (f: ((val: any) => any)) => (
  target: object,
  propertyKey: string,
) => {
  let val = this[propertyKey];

  const get = () => val;
  const set = (newVal) => {
    if (!f(newVal)) {
      throw new Error(`${propertyKey} must satisfy precondition.`);
    }
    val = newVal;
  };

  Object.defineProperty(target, propertyKey, { get, set });
};
