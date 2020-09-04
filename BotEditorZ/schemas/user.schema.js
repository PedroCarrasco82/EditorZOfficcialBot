const Joi = require('@hapi/joi');

module.exports = Joi.object({
        requestDate: Joi.date().iso(),
        discordUsername: Joi.string(),
        discordDiscriminator: Joi.string(),
        email: Joi.string().email().required().custom((value, helper)=>{
            if(value.split('@')[1].split('.')[0] !== 'gmail')
                throw new Error('This email is not gmail domain');
            else
                return value;
        }),
        woozName: Joi.string(),
        instagramName: Joi.string().allow(''),
        language: Joi.string()
    })