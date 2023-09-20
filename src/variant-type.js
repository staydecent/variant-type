import { checkArgTypes as check, toType } from "check-arg-types";

const hasProp = Object.prototype.hasOwnProperty;
const DEFAULT_HANDLER = "_";

function getTestFunc(f) {
  const str = f.toString();
  if (str.includes("native code")) {
    return (v) => toType(v) === toType(f());
  } else {
    return f;
  }
}

export default function VariantFactory(types) {
  const Variant = {};
  const typeNames = Object.keys(types).concat([DEFAULT_HANDLER]);

  if (typeNames.includes("case")) {
    throw new Error("`case` is a reserved key!");
  }

  const checkArgs = (args, caseKey) => {
    if (caseKey === DEFAULT_HANDLER) {
      return;
    }

    const len = types[caseKey].length;
    if (args.length !== len) {
      throw new Error(
        "Arguments did not match for " +
          caseKey +
          ": Expected " +
          len +
          ", Received " +
          args.length,
      );
    }

    const validators = types[caseKey];
    for (let x = 0; x < len; x++) {
      const validator = validators[x];
      const value = args[x];
      if (!getTestFunc(validator)(value)) {
        throw new TypeError(`"${value}" is not a valid ${validator.name}!`);
      }
    }
  };

  typeNames.forEach((type) => {
    Variant[type] = function TypeClosure(...args) {
      checkArgs(args, type);
      args.type = type;
      return args;
    };
  });

  function caseFunc(cases) {
    const Cases = {};
    const caseKeys = Object.keys(cases);

    caseKeys.forEach((caseKey) => {
      if (!typeNames.includes(caseKey)) {
        throw new Error(
          "Invalid case key given for Variant: `" +
            caseKey +
            "` not in [" +
            typeNames.join(", ") +
            "]",
        );
      }

      Cases[caseKey] = function TypeCase() {
        const args = Array.prototype.slice.call(arguments);
        checkArgs(args, caseKey);
        return cases[caseKey].apply(null, args);
      };
    });

    return function handleCaseValue(getType) {
      const args = typeof getType === "function" ? getType() : getType;
      const handler = hasProp.call(Cases, args.type)
        ? Cases[args.type]
        : Cases[DEFAULT_HANDLER];
      if (!handler) {
        throw new Error("No handler found for case: " + args.type);
      }
      return handler.apply(null, args);
    };
  }

  Variant.case = caseFunc;
  Variant.on = caseFunc;

  return Object.freeze(Variant);
}
