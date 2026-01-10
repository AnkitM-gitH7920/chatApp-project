import passwordValidator from "password-validator";

const generalPasswordFormatSchema = new passwordValidator();


generalPasswordFormatSchema
.is().min(10)
.is().max(100)
.has().not().spaces()


export default generalPasswordFormatSchema;