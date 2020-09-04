const Joi = require('@hapi/joi');

module.exports = Joi.object({
        requestDate: Joi.date(),
        discordUsername: Joi.string(),
        discordDiscriminator: Joi.string(),
        email: Joi.string().email().required().custom((value, helper)=>{
            if(value.split('@')[1].split('.')[0] !== 'gmail')
                throw new Error('This email is not gmail domain');
            else
                return value;
        }),
        woozName: Joi.string().custom(value => {
            if(value.includes(' '))
                throw new Error('This WoozNames is invalid');
            else
                return value;
        }),
        instagramName: Joi.string().allow(''),
        language: Joi.string()
    })