const express = require( "express")
const mongoose = require( "mongoose")
const cors = require( 'cors')
const kjv = require( './models/kjv')
const ukjv = require( "./models/ukjv")
const akjv = require( "./models/akjv")
const asv = require( "./models/asv")
const path = require("path");
const app = express()

app.use(cors());
app.use(express.json())
const DB = "mongodb+srv://bible:bibleapp@cluster0.9wj99pn.mongodb.net/bible?retryWrites=true&w=majority"

mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => app.listen(5000)).catch(err => console.log(err))

app.get('/version/:version/:book_no/:chap', async (req, res) => { 
    var data;
    const versions = {
        "kjv" : kjv,
        "ukjv" : ukjv,
        "akjv" : akjv,
        "asv" : asv
    }
    try {
        data = await versions[req.params.version].find({"book_no" : req.params.book_no, "chapter_no" : req.params.chap}).select("verse")

    } catch (error) {
        data = "Server Error"
    }
    if(!data)
        res.status(404).json({data})

    res.status(200).json({data})
 })

 app.get('/verse/:book_no/:chap', async (req, res) => { 
    var data;
    try {
        data = await kjv.find({"book_no" : req.params.book_no, "chapter_no" : req.params.chap}).select("verse").count()
    } catch (error) {
        data = "Server Error"
    }
    if(!data)
        res.status(404).json({data})

    res.status(200).json({"verse":data})
 })

 app.get('/chapter_no/api/:id', async (req, res) => { 
    var data;
    try {
        data = await kjv.find({"book_no" : parseInt(req.params.id), "verse_no" : 1}).count()
    } catch (error) {
        data = "Server Error"
    }
    if(!data)
        res.status(404).json({data})

    res.status(200).json({"chapters":data})
 })

 app.get('/books', async (req, res) => { 
    var data
    try {
        data = await kjv.find({"chapter_no" : 1, "verse_no" : 1}).select("book");
    } catch (error) {
        console.log(error);
        data = "Server Error"
    }
    if(!data)
        res.status(404).json({data})
    var arr = []
    data.forEach((item, index)=>arr.push(item.book))
    res.status(200).json({"books" : arr})
 })

 
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', async (req, res) => { 
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
