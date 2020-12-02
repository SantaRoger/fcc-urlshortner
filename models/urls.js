let mongoose = require('mongoose');
const { Schema } = mongoose;
const dns = require('dns');
const rs = require('randomstring');


const UrlSchema = new Schema({
    displayName: String,
    url: String,
    shortUrl: String,
    ipAddress: String
});

let Url = mongoose.model('Url', UrlSchema);


async function CheckUrl(url) {
    url = FormatUrl(url, true);
    return new Promise((resolve, reject) => {
        dns.lookup(url, (err, address, family) => {
            if(err) reject(err);
            resolve(address);
        });
    });
};

GenerateShortUrl = () => {
    return rs.generate(7);
}

FormatUrl = (url, removePrefix = false) => {
    let regex = /(https?):\/\//

    if(!regex.test(url) && !removePrefix) {
        return `http://${url}`
    }

    if(regex.test(url) && removePrefix) {
        return url
            .replace('https://', '')
            .replace('http://', '');
    }

    return url;
}

exports.Url = Url;
exports.CheckUrl = CheckUrl;
exports.GenerateShortUrl = GenerateShortUrl;
exports.FormatUrl = FormatUrl;
