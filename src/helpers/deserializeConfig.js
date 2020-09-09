import _ from "lodash";

/**
 * Transform config value type
 * @param {String} value
 * @param {String} type
 */
export default function deserializeConfig(value, type) {
  switch (type) {
    case "integer":
      return _.toInteger(value);
    case "float":
      return _.toNumber(value);
    case "json":
      return JSON.parse(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}
