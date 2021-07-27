const express = require('express');
const router = express.Router();

router.get('create',(req,res,next)=>{
    res.status(200).json({
        message : 'Handling Get requests to /products'
    });
});

router.post('/take',(req,res,next)=>{
    res.status(200).json({
        message : 'Handling POST requests to /products'
    });
});

router.get('/result',(req,res,next)=>{
    const id = req.params.productId;
    if(id== 'special'){
        res.status(200).json({
            message : 'you discovered the special id',
            id : id
        });
    }
    else{
        res.status(200).json({
            message : 'you passed an ID'
        });
    }
});

module.exports = router;