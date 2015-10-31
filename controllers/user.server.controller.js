var mongoose = require('mongoose');
var RefreshToken = mongoose.model('RefreshToken');
var User = mongoose.model('User');
var tokenConfig = require('../config/token.server.config');
var jwt = require('jsonwebtoken');
var useragent = require('useragent');
var _ = require('lodash');

//////////////////////////////////////////////////////////
/// User SignUp
exports.signup = function(req, res) {

// check form data
if (!req.body.name || !req.body.password) {
    return res.status(400).json({
        error: true,
        message: "Name or Password can't be blank"
    });
}

// get user agent
var agent = getAgent(req);

// create new user
var newUser = new User();
newUser.name = req.body.name;
newUser.password = newUser.generateHash(req.body.password);
newUser.role = req.body.role || 'User';

newUser.save(function(err, user) {
    if (err) {
        return res.status(500).json({
            error: true,
            message: 'Error: ' + err
        });
    }

    // create token
    var token = createToken(user, agent, tokenConfig.EXP_TIME);
    // create refresh token
    createRefreshToken(user, agent);
    res.status(201).send({
        error: false,
        token: token
    });
});
};

//////////////////////////////////////////////////////////
/// Verify is available
exports.isAvailable = function(req, res) {
User.findOne({
    name: req.params.name
}, function(err, user) {
    if (err) {
        return res.status(500).json({
            error: true,
            message: 'Eroor ' + err
        });
    }

    res.status(200).json({
        error: false,
        data: user
    });
});
};


//////////////////////////////////////////////////////////
/// User SignIn
exports.signin = function(req, res) {

// check form data
if (!req.body.name || !req.body.password) {
    return res.status(400).json({
        error: true,
        message: "Name or Password can't be blank"
    });
}

// get user agent
var agent = getAgent(req);

User.findOne({
    name: req.body.name
}, function(err, user) {
    if (err) {
        return res.status(500).json({
            error: true,
            message: 'Error: ' + err
        });
    }

    if (!user) {
        return res.status(404).json({
            error: true,
            message: "User doesn't exist"
        });
    } else {
        if (!user.validPassword(req.body.password)) {
            return res.status(401).json({
                error: true,
                message: 'Incorrect name or password'
            });
        } else {
            var token = createToken(user, agent, tokenConfig.EXP_TIME);
            // clean refresh token list
            cleanRefreshToken(user);
            // create refresh token
            createRefreshToken(user, agent);
            res.status(200).json({
                error: false,
                token: token
            });
        }
    }
});
};

//////////////////////////////////////////////////////////
/// User logout
exports.logout = function(req, res) {
var agent = getAgent(req);

RefreshToken.find({
    user: req.params.id
}, function(err, token) {
    if (err) {
        res.status(500).json({
            error: true,
            message: 'Error ' + err
        });
    }

    var fetchToken = token.filter(function(e) {
        if (verifyAgent(e.token, agent)) {
            return e;
        }
    });

    console.log(fetchToken);

    if (!fetchToken) {
        return res.status(403).json({
            error: true,
            message: 'Icorrect credentials (agent)'
        });
    }

    RefreshToken.remove({
        _id: fetchToken[0]._id
    }, function(err) {
        if (err) {
            res.status(500).json({
                error: true,
                message: 'Error ' + err
            });
        }

        res.status(200).json({
            error: false,
            message: 'Remove successful'
        });
    });
});
};

//////////////////////////////////////////////////////////
/// User Autorization
exports.isAuth = function(req, res, next) {

var token = req.headers['x-access-token'] || req.headers.authorization;
// angular js headers
if (req.headers.authorization) {
    token = token.split(" ")[1];
}

if (token) {
    // get user agent
    var agent = getAgent(req);
    // verify agent
    if (!verifyAgent(token, agent)) {
        return res.status(403).json({
            error: true,
            message: 'Icorrect credentials (agent)'
        });
    }
    jwt.verify(token, tokenConfig.SECRET_KEY, function(err, decoded) {
        if (err) {
            return res.status(403).json({
                error: true,
                message: 'Incorrect credentials'
            });
        } else {
            req.decoded = decoded;
            next();
        }
    });
} else {
    return res.status(403).json({
        error: true,
        message: 'Incorrect Headers'
    });
}
};

//////////////////////////////////////////////////////////
/// Admin Autorization
exports.isAdmin = function(req, res, next) {
console.log("EN ADMIN AUTH");
if (req.decoded.role === 'Admin') {
    next();
} else {
    return res.status(401).json({
        error: true,
        message: 'You do not have permission'
    });
}
};

//////////////////////////////////////////////////////////
/// Refresh token
exports.refresh = function(req, res, next) {
var token = req.body.token;

if (token) {
    // get user agent
    var agent = getAgent(req);
    // verify agent
    if (!verifyAgent(token, agent)) {
        return res.status(403).json({
            error: true,
            message: 'Icorrect credentials (agent)'
        });
    }

    jwt.verify(token, tokenConfig.SECRET_KEY, function(err, decoded) {
        if (err) {
            // check expiration
            if (err.name === 'TokenExpiredError') {
                // decode token
                var payload = jwt.decode(token);
                // find refresh token
                RefreshToken.findOne({
                    user: payload._id
                }).exec(function(err, data) {
                    if (err) {
                        return res.status(500).json({
                            error: true,
                            message: "Error" + err
                        });
                    }
                    // check data
                    if (data) {
                        // verify refresh token
                        jwt.verify(data.token, tokenConfig.SECRET_KEY, function(err, decoded) {
                            if (err) {
                                return res.status(401).json({
                                    error: true,
                                    message: 'Authentication failure 1'
                                });
                            }

                            // create a new token
                            var newToken = createToken(payload, agent, tokenConfig.EXP_TIME);
                            // set the new token
                            res.status(200).json({
                                error: false,
                                token: newToken
                            });
                        });
                    } else {
                        return res.status(401).json({
                            error: true,
                            message: 'Authentication failure 2'
                        });
                    }
                });
            } else {
                return res.status(401).json({
                    error: true,
                    message: 'Authentication failure 3'
                });
            }
        } else {
            // create new token
            var newToken = createToken(user, decoded.agent, tokenConfig.EXP_TIME);
            // set the new token
            res.status(200).json({
                error: false,
                token: newToken
            });
        }
    });
} else {
    return res.status(403).json({
        error: true,
        message: 'Incorrect credentials'
    });
}
};


//////////////////////////////////////////////////////////
///                 Functions
//////////////////////////////////////////////////////////
var createToken = function(user, agent, exp) {
    var payload = {
        _id: user._id,
        name: user.name,
        role: user.role,
        agent: {
            device: agent.device,
            os: agent.os,
            browser: agent.browser
        }
    };
    var token = jwt.sign(payload, tokenConfig.SECRET_KEY, {
        expiresIn: exp
    });

    return token;
};

var createRefreshToken = function(user, agent) {
    // create refresh token Obj
    var refreshToken = new RefreshToken({
        token: createToken(user, agent, tokenConfig.SESSION_TIME),
        user: user._id,
        agent: agent
    });
    // save refresh token
    refreshToken.save(function(err) {
        if (err) {
            res.status(500).json({
                error: true,
                message: 'Failed to create token'
            });
        }
    });
};

var cleanRefreshToken = function(user) {
    RefreshToken.find({
        user: user._id
    }, function(err, users) {
        users.forEach(function(e) {
            jwt.verify(e.token, tokenConfig.SECRET_KEY, function(err, decoded) {
                if (err) {
                    RefreshToken.remove({
                        _id: e._id
                    }, function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
    });
};

var getAgent = function(req) {
    // fetch user agent    
    var agent = useragent.parse(req.headers['user-agent']);
    var device = {
        device: agent.device.toString(),
        os: agent.os.toString(),
        browser: agent.toAgent()
    };

    return device;
};

var verifyAgent = function(token, agent) {
    var decoded = jwt.decode(token, tokenConfig.SECRET_KEY);
    if (decoded.agent.device === agent.device || decoded.agent.os === agent.os || decoded.agent.browser === agent.browser) {
        return true;
    } else {
        return false;
    }
};


exports.findOne = function(req, res) {
User.findById(req.params.id, function(err, user) {
    res.status(200).jsonp(user);
});
};