// eslint-disable-next-line
export default function extendManyClasses(targetClass: any, mixins: any[]) {
  mixins.forEach((base) => {
    Object.getOwnPropertyNames(base.prototype).forEach((name) => {
      Object.defineProperty(
        targetClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(base.prototype, name) ||
          Object.create(null)
      );
    });
  });
}
