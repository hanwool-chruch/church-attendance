var appRoot = require('app-root-path')
var MODELS = require(appRoot + '/models')

var express = require('express')
var server = require('./server.js')

var router = express.Router()

// define the home page route
//router.get('/', server.memberList)



 const woong = async () => {
	PARTS = await MODELS.PARTS.findAll({raw: true});
	console.log(PARTS);

	MODELS.MEMBERS.findAll()
		.then(members => {
			//res.send(members)
  })
}

woong();

/*
router.get('/list/with_part', aync(req, res) => {
  
	
	
	PARTS = await MODELS.PARTS.findAll();
	console.log(PARTS);
	
	MODELS.MEMBERS.findAll()
		.then(members => {
			//res.send(members)
  })
	.catch(err => {		
	})

	/*	partList.map(function(item){
			item.memberList = [];
		});

		db_memberList.map(function(member){			
			index = -1;

			if(member.PHONE_NO == "" || member.PHONE_NO == null)
				member.PHONE_NO = "010-0000-0000"
			if(member.BIRTHDAY == "" || member.BIRTHDAY == null)
				member.BIRTHDAY = "0000-00-00"

			member.BIRTHDAY = member.BIRTHDAY.substr(2)

			for(i=0; i < partList.length; i++ ){
				if(member.PART_CD == partList[i].PART_CD)
					index = i; 
			}*?


	


})
*/

router.put('/', function(req, res) {

	const member = req.body.member
	models.MEMBERS.create(member)
		.then(result => {
			res.json({})
		})
		.catch(err => {
		})
})

router.post('/:mermberID', function(req, res) {
  const mermberID = req.params.mermberID
	
	models.MEMBERS.update(member, {where: {MEMBER_ID: mermberID}})
		.then(result => {
			res.json({})
		})
		.catch(err => {
		})
})

router.delete('/:mermberID', function(req, res) {
  const mermberID = req.params.mermberID
  MODELS.MEMBERS.destroy({where: {MEMBER_ID: mermberID}})
  .then(result => {
     res.json({})
  })
  .catch(err => {
     console.error(err)
  })
})

module.exports = router
