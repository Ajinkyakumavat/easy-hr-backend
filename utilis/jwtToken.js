// Create,Send and Save the Token in Cookie

const sendToken = (user, statusCode, res) => {

    //Create JWT Token

    const token = user.getJwtToken()

    //Option for Cooke

    const options = {

        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 100
        ),
        httpOnly: true
    }

    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token,
        user
    })
}

module.exports = sendToken;
