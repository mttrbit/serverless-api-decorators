const singletons: object = {};

export const registerSingleton = (target: any) => {
  // const className = target.name;

  const serviceSymbol = '__service__';
  const serviceName = target.prototype[serviceSymbol].name;

  // should implement lazy loading
  (singletons as any)[serviceName] = new target();
};

export const getSingleton = (name: string) => (singletons as any)[name];

export const getServices = () => singletons;

// export class DIManager {
//
//   private singletons: Object = {};
//
//   constructor() {
//
//   }
//
//   public registrer(singleton: any) {
//     d('registering singleton:', singleton);
//     // this.singletons[singleton.constructor.name] = new singleton();
//   }
//
// }
