
export const validation = (schema) => {
  return (req, res, next) => {
    // console.log(Object.keys(schema));  // return array of strings

    let validationError = [];
//! Loop through each key in the schema (e.g., 'body', 'params')
    for (const key of Object.keys(schema)) {
//! Bracket notation (schema[key]) allows you to use a variable or expression to dynamically access
//! validate Method When you create a Joi schema (e.g., Joi.object({...})), it returns a Joi schema object
//!
      const data = schema[key].validate(req[key], { abortEarly: false });
      if (data?.error) {
        validationError.push(data?.error?.details);
      }
    }

    if (validationError.length) {
      return res.status(400).json({ error: validationError });
    }

    return next();
  };
};
