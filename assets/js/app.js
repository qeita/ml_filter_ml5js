const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let isLoadedMetaData = false
let constraints = { audio: false, video: {facingMode: 'user'} }

let style
let isTransferring = false
let resultImg


function start(){
  navigator.mediaDevices.getUserMedia( constraints )
    .then( mediaStrmSuccess )
    .catch( mediaStrmFailed )
}

function mediaStrmSuccess( stream ){
  video.srcObject = stream

  // ウェブカムのサイズを取得し、canvasにも適用
  if(isLoadedMetaData) return
  isLoadedMetaData = true

  video.addEventListener('loadedmetadata', () => {
    video.width = video.videoWidth
    video.height = video.videoHeight
    canvas.width = video.videoWidth  
    canvas.height = video.videoHeight

    resultImg = createImg('')
    resultImg.hide()

    style = ml5.styleTransfer('assets/models/udnie', video, modelLoaded)

    requestAnimationFrame( drawVideo )
  }, false)
}

function mediaStrmFailed( e ){
  console.log( e )
}

function stop(){
  let stream = video.srcObject
  let tracks = stream.getTracks()

  tracks.forEach( (track) => {
    track.stop()
  })
  video.srcObject = null
}

function modelLoaded(){
  select('#status').html('Model Loaded')
}

function drawVideo(){
  if(isTransferring){
    ctx.drawImage(resultImg.elt, 0, 0, canvas.width, canvas.height)
  }else{
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  }
  requestAnimationFrame( drawVideo )
}

function gotResult(err, img){
  resultImg.attribute('src', img.src)
  if(isTransferring){
    style.transfer(gotResult)
  }
}


/**
 * ストリームのコントロール
 */
const stopBtn = document.getElementById('stop')
const frontBtn = document.getElementById('front')
const rearBtn = document.getElementById('rear')

let ua = navigator.userAgent
if(ua.indexOf('iPhone') < 0 && ua.indexOf('Android') < 0 && ua.indexOf('Mobile') < 0 && ua.indexOf('iPad') < 0){
  frontBtn.disabled = true
  rearBtn.disabled = true
}

stopBtn.addEventListener('click', () => {
  if(isTransferring){
    stopBtn.textContent = 'START'
  }else{
    stopBtn.textContent = 'STOP'
    style.transfer( gotResult )
  }
  isTransferring = !isTransferring
}, false)

frontBtn.addEventListener('click', () => {
  stop()
  constraints.video.facingMode = 'user'
  setTimeout( () => {
    start()
  }, 500)
}, false)

rearBtn.addEventListener('click', () => {
  stop()
  constraints.video.facingMode = 'environment'
  setTimeout( () => {
    start()
  }, 500)
}, false)


function setup(){
  // console.log('setup')
  start()
}

function draw(){
  // console.log('draw')
}
