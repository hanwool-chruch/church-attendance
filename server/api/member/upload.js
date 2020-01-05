const appRoot = require('app-root-path')
const util = require("util");
const multer = require('multer');
const Sharp = require('sharp');
const oriImagePath = appRoot + "/app/photo/original";
const destImagePath = appRoot + "/app/photo/resize";

const _ = {}

const storage = multer.diskStorage({
  // 서버에 저장할 폴더
  destination: function (req, file, cb) {
    cb(null, oriImagePath);
  },

  // 서버에 저장할 파일 명
  filename: (req, file, cb) => {
    file.uploadedFile = {
      name: req.params.mermberID,
      ext: "jpg"
    };

    let nowTime = req.nowTime

    image_name = file.uploadedFile.name + "_" + nowTime + "." + "jpg"

    console.log(image_name);
    console.log(oriImagePath + '/' + image_name);
    //updateMemberImage(db, new_image_name, memberId);
    cb(null, image_name);
  },
  onError: function (err, next) {
    console.log('error', err);
    next(err);
  },
});

const upload_file = multer({ storage: storage }).single('file');

_.upload = async (req, res) => {

  let nowTime = Date.now();
  req.nowTime = nowTime;

  var image_name = req.params.mermberID + "_" + nowTime + ".jpg"

  const upload = util.promisify(upload_file);
  await upload(req, res);
  console.log("DSDDDDD : " + image_name)

  await Sharp(oriImagePath + '/' + image_name)
  .rotate()
  .resize(400, 400)
  .toFile(destImagePath + '/' + image_name);
  
  return image_name
  
};

module.exports = _ 