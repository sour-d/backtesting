export const getProps = (obj: any) => {
  return {
    keys: Object.keys(obj),
    defaultValue: Object.values(obj),
  };
};
