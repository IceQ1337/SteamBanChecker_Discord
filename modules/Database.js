const Path = require('path');
const NeDB = require('nedb');
const Events = require('events');

const ProfileDB = new NeDB({ filename: Path.join(__dirname, '../datastore/profiles.db'), autoload: true });
ProfileDB.ensureIndex({ fieldName: 'SteamID', unique: true }, (err) => {
    if (err) {
        console.error(new Error(`[${new Date().toUTCString()}] NEDB (ProfileDB.ensureIndex) > ${err}`));
    }
});

module.exports = function() {
    this.db = ProfileDB;
    this.events = new Events.EventEmitter();

    this.addProfile = (profileData) => {
        return new Promise((resolve, reject) => {
            this.db.insert(profileData, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    this.updateProfile = (steamID, updateData) => {
        this.db.update({ SteamID: steamID }, { $set: updateData }, {}, (err) => {
            if (err) {
                _this.events.emit('error', 'updateProfile', err);
            }
        });
    };

    this.getProfile = (steamID) => {
        return new Promise((resolve, reject) => {
            this.db.findOne({ SteamID: steamID }, (err, profile) => {
                if (err) {
                    reject(err);
                }
                resolve(profile);
            });
        });
    };

    this.getProfiles = () => {
        return new Promise((resolve, reject) => {
            this.db.find({}, (err, profiles) => {
                if (err) {
                    reject(err);
                }
                resolve(profiles);
            });
        });
    };

    this.getTrackedProfiles = () => {
        return new Promise((resolve, reject) => {
            this.db.find({ Tracked: true }, { SteamID: 1, _id: 0 }, (err, profiles) => {
                if (err) {
                    reject(err);
                }

                var result = [];
                profiles.forEach((profile) => {
                    result.push(profile.SteamID);
                });
                resolve(result);
            });
        });
    };

    this.getStats = (user) => {
        return new Promise((resolve, reject) => {
            this.getProfiles().then((profiles) => {

                var totalProfiles = profiles.length;
                var bannedProfiles = 0;
                
                var totalProfilesUser = 0;
                var bannedProfilesUser = 0;

                if (profiles.length > 0) {
                    profiles.forEach((profile) => {
                        if (!profile.Tracked) {
                            bannedProfiles++;
                        }

                        if (profile.User == user) {
                            totalProfilesUser++;
                            if (!profile.Tracked) {
                                bannedProfilesUser++;
                            }
                        }
                    });

                    const stats = { totalProfiles: totalProfiles, bannedProfiles: bannedProfiles, totalProfilesUser: totalProfilesUser, bannedProfilesUser: bannedProfilesUser };
                    resolve(stats);
                } else {
                    resolve();
                }
            }).catch((err) => {
                reject(err);
            });
        });
    };
}