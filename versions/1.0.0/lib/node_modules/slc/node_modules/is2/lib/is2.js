/**
 * @fileOverview
 * is2 derived from is by Enrico Marino, adapted for Node.js.
 * License remains the same.
 * Slightly modified by Edmond Meinfelder
 *
 * is
 * the definitive JavaScript type testing library
 * Copyright(c) 2013 Edmond Meinfelder <edmond@stdarg.com>
 * Copyright(c) 2011 Enrico Marino <enrico.marino@email.com>
 * MIT license
 */
'use strict';
var owns = {}.hasOwnProperty;
var toString = {}.toString;
exports.version = '0.1.5';

/**
 * Test if 'value' is a type of 'type'.
 * Alias: a
 * @param value value to test.
 * @param {String} type THe name of the type.
 * @return {Boolean} true if 'value' is an arguments object, false otherwise.
 */
exports.type = function (value, type) {
    return typeof value === type;
};
exports.a = exports.type;

/**
 * Test if 'value' is defined.
 * Alias: def
 * @param {Any} value The value to test.
 * @return {Boolean} true if 'value' is defined, false otherwise.
 */
exports.defined = function (value) {
    return typeof value !== 'undefined';
};
exports.def = exports.defined;

/**
 * Test is 'value' is either null or undefined.
 * Alias: nullOrUndef
 * @param {Any} value value to test.
 * @return {Boolean} True if value is null or undefined, false otherwise.
 */
exports.nullOrUndef = function(value) {
    return value === null || typeof value === 'undefined';
};
exports.nullOrUndefined = exports.nullOrUndef;

/**
 * Test if 'value' is empty. To be empty means to be an array, object or string with nothing contained.
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is empty, false otherwise.
 */
exports.empty = function (value) {
    var type = toString.call(value);

    if ('[object Array]' === type || '[object Arguments]' === type) {
        return value.length === 0;
    }

    if ('[object Object]' === type) {
        for (var key in value) if (owns.call(value, key)) return false;
        return true;
    }

    if ('[object String]' === type) {
        return value === '';
    }

    return false;
};

/**
 * Do a deep comparision of two objects for equality. Will recurse without any limits. Meant to be
 * called by equal only.
 * @param {Object} value The first object to compare.
 * @param {Object} other The second object to compare.
 * @return {Boolean} true, if the objects are equivalent, false otherwise.
 * @api private
 */
exports.objEquals = function (value, other) {
    var key;

    for (key in other) {
        // ensure all the keys that exist in obj, exist in otherObj
        if (typeof other[key] !== 'undefined' && typeof (other[key]) === 'undefined') {
            return false;
        }

        // if the types don't match, there is no equivalance
        if (typeof other[key] !== typeof (other[key])) {
            return false;
        }

        // The types match, so we need to see if we have to do a deep check
        switch (typeof (other[key])) {
        case 'object':
            if (exports.array(other[key])) {
                if (!exports.array(value[key])) {
                    return false;
                }
                if (value.length !== other.length) {
                    return false;
                }
                var len = other.length;
                while (--len) {
                    if (value[len] !== other[len]) {
                        return false;
                    }
                }
            } else {
                if (!exports.equal(other[key], value[key])) {
                    return false;
                }
            }
            break;
        case 'function':
            if (typeof (value[key]) === 'undefined' ||
              (key !== 'equals' && other[key].toString() !== value[key].toString())) {
                return false;
            }
            break;
        default:
            if (other[key] !== value[key]) {
                return false;
            }
            break;
        }
    }

    for (key in value) {
        if (typeof (other[key]) === 'undefined') {
            return false;
        }
    }

    return true;
};

/**
 * Test if 'value' is equal to 'other'. Works for objects and arrays and will do deep comparisions,
 * using recursion.
 * Alias: eq
 * @param {Any} value value.
 * @param {Any} other value to compare with.
 * @return {Boolean} true if 'value' is equal to 'other', false otherwise
 */
exports.equal = function (value, other) {
    var type = toString.call(value);

    if (typeof value !== typeof other) {
        return false;
    }


    if (type !== toString.call(other)) {
        return false;
    }

    if ('[object Object]' === type) {
        return exports.objEquals(value, other);
    } else if ('[object Array]' === type) {
        var index = value.length;
        if (index !== other.length) {
            return false;
        }
        while (--index > -1) {
            if (!exports.equal(value[index], other[index])) {
                return false;
            }
        }
        return true;

    } else if ('[object Function]' === type) {
        return value.prototype === other.prototype;
    } else if ('[object Date]' === type) {
        return value.getTime() === other.getTime();
    }

    return value === other;
};
exports.eq = exports.equal;

/**
 * JS Type definitions which cannot host values.
 * @api private
 */
var NON_HOST_TYPES = {
    'boolean': 1,
    'number': 1,
    'string': 1,
    'undefined': 1
};

/**
 * Test if 'key' in host is an object. To be hosted means host[value] is an object.
 * @param {Any} value The value to test.
 * @param {Any} host Host that may contain value.
 * @return {Boolean} true if 'value' is hosted by 'host', false otherwise.
 */
exports.hosted = function (value, host) {
    if (exports.nullOrUndef(value))
        return false;
    var type = typeof host[value];
    return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * Test if 'value' is an instance of 'constructor'.
 * Aliases: instOf, instanceof
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is an instance of 'constructor'.
 */
exports.instanceOf = function (value, constructor) {
    if (exports.nullOrUndef(value) || exports.nullOrUndef(constructor))
        return false;
    return (value instanceof constructor);
};
exports.instOf = exports.instanceof = exports.instanceOf;

/**
 * Test if 'value' is null.
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is null, false otherwise.
 */
exports.null = function (value) {
    return value === null;
};

/**
 * Test if 'value' is undefined.
 * Aliases: undef, udef
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is undefined, false otherwise.
 */
exports.undefined = function (value) {
    return value === undefined;
};
exports.udef = exports.undef = exports.undefined;

/**
 * Test if 'value' is an arguments object.
 * Alias: args
 * @param {Any} value value to test
 * @return {Boolean} true if 'value' is an arguments object, false otherwise
 */
exports.arguments = function (value) {
    return '[object Arguments]' === toString.call(value);
};
exports.args = exports.arguments;

/**
 * Test if 'value' is an arguments object that is empty.
 * Alias: args
 * @param {Any} value value to test
 * @return {Boolean} true if 'value' is an arguments object with no args, false otherwise
 */
exports.emptyArguments = function (value) {
    return '[object Arguments]' === toString.call(value) && value.length === 0;
};
exports.emptyArgs = exports.emptyArguments;

/**
 * Test if 'value' is an array.
 * Alias: ary, arry
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is an array, false otherwise.
 */
exports.array = function (value) {
    return '[object Array]' === toString.call(value);
};
exports.ary = exports.arry = exports.array;

/**
 * Test if 'value' is an array containing at least 1 entry.
 * Aliases: nonEmptyArry, nonEmptyAry
 * @param {Any} value The value to test.
 * @return {Boolean} true if 'value' is an array with at least 1 value, false otherwise.
 */
exports.nonEmptyArray = function (value) {
    return '[object Array]' === toString.call(value) && value.length > 0;
};
exports.nonEmptyArry = exports.nonEmptyAry = exports.nonEmptyArray;

/**
 * Test if 'value' is an array containing no entries.
 * Aliases: emptyArry, emptyAry
 * @param {Any} value The value to test.
 * @return {Boolean} true if 'value' is an array with no elemnets.
 */
exports.nonEmptyArray = function (value) {
    return '[object Array]' === toString.call(value) && value.length === 0;
};
exports.nonEmptyArry = exports.nonEmptyAry = exports.nonEmptyArray;

/**
 * Test if 'value' is an empty array(like) object.
 * Aliases: arguents.empty, args.empty, ary.empty, arry.empty
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is an empty array(like), false otherwise.
 */
exports.array.empty = function (value) {
    return value.length === 0;
};
exports.arguments.empty = exports.args.empty = exports.ary.empty = exports.arry.empty = exports.array.empty;

/**
 * Test if 'value' is an arraylike object (i.e. it has a length property with a valid value)
 * Aliases: arraylike, arryLike, aryLike
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is an arguments object, false otherwise.
 */
exports.arrayLike = function (value) {
    if (exports.nullOrUndef(value))
        return false;
    return value !== undefined &&
        owns.call(value, 'length') &&
        isFinite(value.length);
};
exports.arryLike = exports.aryLike = exports.arraylike = exports.arrayLike;

/**
 * Test if 'value' is a boolean.
 * Alias: bool
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is a boolean, false otherwise.
 */
exports.boolean = function (value) {
    return '[object Boolean]' === toString.call(value);
};
exports.bool = exports.boolean;

/**
 * Test if 'value' is false.
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is false, false otherwise
 */
exports.false = function (value) {
    return value === false;
};

/**
 * Test if 'value' is true.
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is true, false otherwise.
 */
exports.true = function (value) {
    return value === true;
};

/**
 * Test if 'value' is a date.
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is a date, false otherwise.
 */
exports.date = function (value) {
    return '[object Date]' === toString.call(value);
};

/**
 * Test if 'value' is an error object.
 * Alias: err
 * @param value value to test.
 * @return {Boolean} true if 'value' is an error object, false otherwise.
 */
exports.error = function (value) {
    return '[object Error]' === toString.call(value);
};
exports.err = exports.error;

/**
 * Test if 'value' is a function.
 * Alias: func
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is a function, false otherwise.
 */
exports.function = function(value) {
    return '[object Function]' === toString.call(value);
};
exports.func = exports.function;

/**
 * Test if 'value' is a number.
 * Alias: num
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a number, false otherwise.
 */
exports.number = function (value) {
    return '[object Number]' === toString.call(value);
};
exports.num = exports.number;

/**
 * Test if 'value' is a positive number.
 * Alias: positiveNum, posNum
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a number, false otherwise.
 */
exports.positiveNumber = function (value) {
    return '[object Number]' === toString.call(value) && value > 0;
};
exports.posNum = exports.positiveNum = exports.positiveNumber;

/**
 * Test if 'value' is a negative number.
 * Aliases: negNum, negativeNum
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a number, false otherwise.
 */
exports.negativeNumber = function (value) {
    return '[object Number]' === toString.call(value) && value < 0;
};
exports.negNum = exports.negativeNum = exports.negativeNumber;

/**
 * Test if 'value' is a decimal number.
 * Aliases: decimalNumber, decNum
 * @param {Any} value value to test.
 * @return {Boolean} true if 'value' is a decimal number, false otherwise.
 */
exports.decimal = function (value) {
    return '[object Number]' === toString.call(value) && value % 1 !== 0;
};
exports.decNum = exports.decNumer = exports.decimal;

/**
 * Test if 'value' is divisible by 'n'.
 * Alias: divisBy
 * @param {Number} value value to test.
 * @param {Number} n dividend.
 * @return {Boolean} true if 'value' is divisible by 'n', false otherwise.
 */
exports.divisibleBy = function (value, n) {
    if (value === 0)
        return false;
    return '[object Number]' === toString.call(value) &&
        n !== 0 &&
        value % n === 0;
};
exports.divisBy = exports.divisibleBy;

/**
 * Test if 'value' is an integer.
 * Alias: integer
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is an integer, false otherwise.
 */
exports.int = function (value) {
    return '[object Number]' === toString.call(value) && value % 1 === 0;
};
exports.integer = exports.int;

/**
 * Test if 'value' is a positive integer.
 * Alias: posInt
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a positive integer, false otherwise.
 */
exports.positiveInt = function (value) {
    return '[object Number]' === toString.call(value) && value % 1 === 0 && value > 0;
};
exports.posInt = exports.positiveInteger = exports.positiveInt;

/**
 * Test if 'value' is a negative integer.
 * Aliases: negInt, negativeInteger
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a negative integer, false otherwise.
 */
exports.negativeInt = function (value) {
    return '[object Number]' === toString.call(value) && value % 1 === 0 && value < 0;
};
exports.negativeInteger = exports.negInt = exports.negativeInt;

/**
 * Test if 'value' is greater than 'others' values.
 * Alias: max
 * @param {Number} value value to test.
 * @param {Array} others values to compare with.
 * @return {Boolean} true if 'value' is greater than 'others' values.
 */
exports.maximum = function (value, others) {
    if (!exports.arrayLike(others) || !exports.number(value))
        return false;

    var len = others.length;
    while (--len > -1) {
        if (value < others[len]) {
            return false;
        }
    }

    return true;
};
exports.max = exports.maximum;

/**
 * Test if 'value' is less than 'others' values.
 * Alias: min
 * @param {Number} value value to test.
 * @param {Array} others values to compare with.
 * @return {Boolean} true if 'value' is less than 'others' values.
 */
exports.minimum = function (value, others) {
    if (!exports.arrayLike(others) || !exports.number(value))
        return false;

    var len = others.length;
    while (--len > -1) {
        if (value > others[len]) {
            return false;
        }
    }

    return true;
};
exports.notANumber = exports.notANum = exports.nan;

/**
 * Test if 'value' is an even number.
 * @param {Number} value to test.
 * @return {Boolean} true if 'value' is an even number, false otherwise.
 */
exports.even = function (value) {
    return '[object Number]' === toString.call(value) && value % 2 === 0;
};

/**
 * Test if 'value' is an odd number.
 * @param {Number} value to test.
 * @return {Boolean} true if 'value' is an odd number, false otherwise.
 */
exports.odd = function (value) {
    return !exports.decimal(value) && '[object Number]' === toString.call(value) && value % 2 !== 0;
};

/**
 * Test if 'value' is greater than or equal to 'other'.
 * Aliases: greaterOrEq, greaterOrEqual
 * @param {Number} value value to test.
 * @param {Number} other value to compare with.
 * @return {Boolean} true, if value is greater than or equal to other, false otherwise.
 */
exports.ge = function (value, other) {
    return value >= other;
};

/**
 * Test if 'value' is greater than 'other'.
 * Aliases: greaterThan
 * @param {Number} value value to test.
 * @param {Number} other value to compare with.
 * @return {Boolean} true, if value is greater than other, false otherwise.
 */
exports.gt = function (value, other) {
    return value > other;
};
exports.greaterThan = exports.gt;

/**
 * Test if 'value' is less than or equal to 'other'.
 * Alias: lessThanOrEq, lessThanOrEqual
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} true, if 'value' is less than or equal to 'other', false otherwise.
 */
exports.le = function (value, other) {
    return value <= other;
};
exports.lessThanOrEq = exports.lessThanOrEqual = exports.le;

/**
 * Test if 'value' is less than 'other'.
 * Alias: lessThan
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} true, if 'value' is less than 'other', false otherwise.
 */
exports.lt = function (value, other) {
    return value < other;
};
exports.lessThan = exports.lt;

/**
 * Test if 'value' is within 'start' and 'finish'.
 * Alias: withIn
 * @param {Number} value value to test.
 * @param {Number} start lower bound.
 * @param {Number} finish upper bound.
 * @return {Boolean} true if 'value' is is within 'start' and 'finish', false otherwise.
 */
exports.within = function (value, start, finish) {
    return value >= start && value <= finish;
};
exports.withIn = exports.within;

/**
 * Test if 'value' is an object. Note: Arrays, RegExps, Date, Error, etc all return false.
 * Alias: obj
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is an object, false otherwise.
 */
exports.object = function (value) {
    return '[object Object]' === toString.call(value);
};
exports.obj = exports.object;

/**
 * Test if 'value' is an object with properties. Note: Arrays are objects.
 * Alias: nonEmptyObj
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is an object, false otherwise.
 */
exports.nonEmptyObject = function (value) {
    return '[object Object]' === toString.call(value) && Object.keys(value).length;
};
exports.nonEmptyObj = exports.nonEmptyObject;

/**
 * Test if 'value' is an instance type objType.
 * Aliases: objInstOf, objectinstanceof, instOf, instanceOf
 * @param {object} objInst an object to testfor type.
 * @param {object} objType an object type to compare.
 * @return {Boolean} true if 'value' is an object, false otherwise.
 */
exports.objectInstanceof = function (objInst, objType) {
    return '[object Object]' === toString.call(objInst) && (objInst instanceof objType);
};
exports.instOf = exports.instanceOf = exports.objInstOf = exports.objectInstanceOf = exports.objectInstanceof;

/**
 * Test if 'value' is a regular expression.
 * Alias: regexp
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a regexp, false otherwise.
 */
exports.regexp = function (value) {
    return '[object RegExp]' === toString.call(value);
};
exports.regExp = exports.regexp;

/**
 * Test if 'value' is a string.
 * Alias: str
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a string, false otherwise.
 */
exports.string = function (value) {
    return '[object String]' === toString.call(value);
};
exports.str = exports.string;

/**
 * Test if 'value' is an empty string.
 * Alias: emptyStr
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is am empty string, false otherwise.
 */
exports.emptyString = function (value) {
    return exports.string(value) && value.length === 0;
};
exports.emptyStr = exports.emptyString;

/**
 * Test if 'value' is a non-empty string.
 * Alias: nonEmptyStr
 * @param {Any} value to test.
 * @return {Boolean} true if 'value' is a non-empty string, false otherwise.
 */
exports.nonEmptyString = function (value) {
    return exports.string(value) && value.length > 0;
};
exports.nonEmptyStr = exports.nonEmptyString;
