const mongoose=require('mongoose');
require('dotenv').config();

exports.connect= ()=>{
    mongoose.connect(process.env.MONGOOSE_URL ,{
        useNewUrlParser: true,
        useUnifiedTopology: true,

    })
    .then(()=> {
        console.log("DB Connected successfully");
    })
    .catch((err)=>{
        console.log("Some error occored");
        console.error(err);
        process.exit(1);
    })
}

