// when everything is ready, automatically start everything ?

var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');	

/*********** Setup of video/webcam and checking for webGL support *********/

var videoReady = false;
var imagesReady = false;

function enablestart() {
	if (videoReady && imagesReady) {
		var startbutton = document.getElementById('startbutton');
		startbutton.value = "start";
		startbutton.disabled = null;
	}
}

$(window).load(function() {
	imagesReady = true;
	//enablestart();
	
	$('#container').fadeIn(2000, function() {
		$('#container').removeClass('blur');
		setTimeout(function() {
			$('.video-message').fadeOut();
		}, 2000);
		startVideo();
	});
});

var insertAltVideo = function(video) {
	if (supports_video()) {
		if (supports_ogg_theora_video()) {
			video.src = "../media/cap13_edit2.ogv";
		} else if (supports_h264_baseline_video()) {
			video.src = "../media/cap13_edit2.mp4";
		} else {
			return false;
		}
		//video.play();
		return true;
	} else return false;
}

// check whether browser supports webGL
var webGLContext;
var webGLTestCanvas = document.createElement('canvas');
if (window.WebGLRenderingContext) {
	webGLContext = webGLTestCanvas.getContext('webgl') || webGLTestCanvas.getContext('experimental-webgl');
	if (!webGLContext || !webGLContext.getExtension('OES_texture_float')) {
		webGLContext = null;
	}
}
if (webGLContext == null) {
	alert("Your browser does not seem to support WebGL. Unfortunately this face mask example depends on WebGL, so you'll have to try it in another browser. :(");
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.getUserMedia) {
	// set up stream
	
	// chrome 19 shim
	var videoSelector = {video : true};
	if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
		var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
		if (chromeVersion < 20) {
			videoSelector = "video";
		}
	};
	
	navigator.getUserMedia(videoSelector, function( stream ) {
		if (vid.mozCaptureStream) {
			vid.mozSrcObject = stream;
		} else {
			vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
		}
		vid.play();
	}, function() {
		insertAltVideo(vid);
		alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
	});
} else {
	insertAltVideo(vid);
	alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

vid.addEventListener('canplay', function() {
	videoReady = true;
	//enablestart();
}, false);

/*********** Code for face substitution *********/

var animationRequest;
var positions;

var ctrack = new clm.tracker();
ctrack.init(pModel);

//document.getElementById('selectmask').addEventListener('change', updateMask, false);

function updateMask(newMask) {
	currentMask = newMask;
	var positions = ctrack.getCurrentPosition(vid);
	if (positions) {
		switchMasks(positions);
	}
}

function startVideo() {
	// start video
	vid.play();
	// start tracking
	ctrack.start(vid);
	// start drawing face grid
	drawGridLoop();
}

var fd = new faceDeformer();
fd.init(document.getElementById('webgl'));
var wc1 = document.getElementById('webgl').getContext('webgl') || document.getElementById('webgl').getContext('experimental-webgl')
wc1.clearColor(0,0,0,0);

var fd2 = new faceDeformer();
fd2.init(document.getElementById('webgl2'));
var wc2 = document.getElementById('webgl2').getContext('webgl') || document.getElementById('webgl2').getContext('experimental-webgl')
wc2.clearColor(0,0,0,0);

var masks = {
	"walter" : [[21.060764903593935, 23.625922265374243], [24.306589250104111, 82.418736978583837], [29.887480558415291, 123.52324050386761], [39.831216823892362, 169.58896662877407], [56.335070257713795, 208.02264871738436], [80.83703098412272, 239.09972028159933], [112.71581076572778, 260.86442641371349], [148.15849351544631, 266.69887307481594], [187.92956781495144, 259.94808309698487], [224.28242219428836, 232.92409488998584], [248.61360434331704, 197.4132216415324], [267.6255386426007, 159.22848713841142], [274.06946800796993, 115.04205523453288], [279.57264995946605, 75.577994810142314], [274.8147191886797, 27.93465035602847], [243.21321805049308, 34.977887137176154], [222.77074074138181, 27.896989700591064], [190.0620481119081, 30.307609477713669], [159.27010163455151, 35.824855447032391], [51.033153870664592, 38.112001064409583], [75.392081525881991, 35.207713004503645], [102.74022206320058, 37.331330371284338], [124.56616025441463, 38.787179979952285], [67.451381950900242, 57.279940574514285], [90.044614607889713, 50.578228454933793], [111.78861952878373, 57.042466275764184], [90.903644751441476, 61.901327302928138], [90.715389774152072, 55.427091197335699], [223.99115821955013, 52.230403503055442], [205.18136904851377, 47.795771446298119], [184.90200898390299, 54.36443314080293], [204.67995257670333, 57.277939005103178], [204.92195881859544, 50.712535873236902], [146.50907007729293, 46.432109337738268], [115.95255333726485, 107.46593045529727], [109.22792349913794, 119.47849063536196], [117.00821443824393, 134.84341026421072], [145.67296091894715, 139.65462387898862], [173.67398162073596, 137.75538299827045], [185.00619633858076, 121.44588720141769], [180.64955597511778, 108.4547161320798], [147.27934367148265, 85.136485659341048], [124.32188592953989, 129.20306658959251], [167.29393856301289, 130.98984492081911], [101.59640357940233, 178.49694962096316], [118.21488930910681, 170.49617831223611], [139.18293919359641, 169.52754924913722], [151.13320163675684, 173.77693897734923], [167.32315821430757, 170.41084550370888], [182.37144722622213, 172.04427561978318], [198.17756373260085, 178.48935722147763], [184.440295252439, 186.17852019611308], [168.46308888233028, 189.07826517145685], [149.98168191113766, 189.67271148067312], [131.94804230553046, 187.67924933109754], [115.53452060145878, 185.3486212656689], [126.11701238101571, 180.30913427171828], [151.51451552828283, 182.42858464837599], [175.33473635294803, 181.769054498201], [176.96189091245589, 177.03898480289513], [151.40990278903843, 177.58200927291426], [127.15568541835768, 176.24970135595123], [147.26055194223767, 122.55189537474888], [74.747311503817315, 52.428814802906686], [103.91716767645684, 51.310986682531166], [102.84404568037712, 59.974636811905299], [76.675078380855666, 60.093874542162325], [216.58585024902322, 47.512012033316537], [190.54061564242585, 48.580342228676585], [191.79112935486376, 55.322342001097468], [214.83596488608993, 56.255513236279938]]
};

var images = ["walter"];
var currentMask = 0;

// canvas for copying the warped face to
var newcanvas = document.createElement('CANVAS');
newcanvas.width = vid.width;
newcanvas.height = vid.height;
// canvas for copying videoframes to
var videocanvas = document.createElement('CANVAS');
videocanvas.width = vid.width;
videocanvas.height = vid.height;
// canvas for masking
var maskcanvas = document.createElement('CANVAS');
maskcanvas.width = vid.width;
maskcanvas.height = vid.height;	
// create canvases for all the faces
window.imageCanvases = {};
for (var i = 0;i < images.length;i++) {
	console.log($("#"+images[i]));
	$("#"+images[i]).load(function(obj) {
		var elementId = obj.target.id;

		// copy the images to canvases
		imagecanvas = document.createElement('CANVAS');
		imagecanvas.width = obj.target.width;
		imagecanvas.height = obj.target.height;
		imagecanvas.getContext('2d').drawImage(obj.target,0,0);
		imageCanvases[elementId] = imagecanvas;

		console.log(elementId, imageCanvases);
	});
}

var extended_vertices = [
  [0,71,72,0],
  [0,72,1,0],
  [1,72,73,1],
  [1,73,2,1],
  [2,73,74,2],
  [2,74,3,2],
  [3,74,75,3],
  [3,75,4,3],
  [4,75,76,4],
  [4,76,5,4],
  [5,76,77,5],
  [5,77,6,5],
  [6,77,78,6],
  [6,78,7,6],
  [7,78,79,7],
  [7,79,8,7],
  [8,79,80,8],
  [8,80,9,8],
  [9,80,81,9],
  [9,81,10,9],
  [10,81,82,10],
  [10,82,11,10],
  [11,82,83,11],
  [11,83,12,11],
  [12,83,84,12],
  [12,84,13,12],
  [13,84,85,13],
  [13,85,14,13],
  [14,85,86,14],
  [14,86,15,14],
  [15,86,87,15],
  [15,87,16,15],
  [16,87,88,16],
  [16,88,17,16],
  [17,88,89,17],
  [17,89,18,17],
  [18,89,90,18],
  [18,90,22,18],
  [22,90,21,22],
  [21,90,91,21],
  [21,20,91,21],
  [20,91,92,20],
  [20,92,19,20],
  [19,92,93,19],
  [19,93,71,19],
  [19,0,71,19],
  [44,61,56,44],
  [60,61,56,60],
  [60,56,57,60],
  [60,59,57,60],
  [58,59,57,58],
  [58,59,50,58]
];

function drawGridLoop() {
	// get position of face
	positions = ctrack.getCurrentPosition(vid);

	overlayCC.clearRect(0, 0, 500, 375);
	if (positions) {
		// draw current grid
		ctrack.draw(overlay);
	}
	// check whether mask has converged
	var pn = ctrack.getConvergence();
	if (pn < 0.4) {
		switchMasks(positions);
	} else {
		requestAnimFrame(drawGridLoop);
	}
}
	
function switchMasks(pos) {
	videocanvas.getContext('2d').drawImage(vid,0,0,videocanvas.width,videocanvas.height);
	
	// we need to extend the positions with new estimated points in order to get pixels immediately outside mask
	var newMaskPos = masks[images[currentMask]].slice(0);
	var newFacePos = pos.slice(0);
	var extInd = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,22,21,20,19];
	var newp;
	for (var i = 0;i < 23;i++) {
		newp = [];
		newp[0] = (newMaskPos[extInd[i]][0]*1.3) - (newMaskPos[62][0]*0.3);// short for ((newMaskPos[extInd[i]][0]-newMaskPos[62][0])*1.1)+newMaskPos[62][0]
		newp[1] = (newMaskPos[extInd[i]][1]*1.3) - (newMaskPos[62][1]*0.3);
		newMaskPos.push(newp);
		newp = [];
		newp[0] = (newFacePos[extInd[i]][0]*1.3) - (newFacePos[62][0]*0.3);
		newp[1] = (newFacePos[extInd[i]][1]*1.3) - (newFacePos[62][1]*0.3);
		newFacePos.push(newp);
	}
	// also need to make new vertices incorporating area outside mask
	var newVertices = pModel.path.vertices.concat(extended_vertices);

	console.log(imageCanvases[images[currentMask]]);

	// deform the mask we want to use to face form
	fd2.load(imageCanvases[images[currentMask]], newMaskPos, pModel, newVertices);
	fd2.draw(newFacePos);
	// and copy onto new canvas
	newcanvas.getContext('2d').drawImage(document.getElementById('webgl2'),0,0);

	// create masking
	var tempcoords = positions.slice(0,18);
	tempcoords.push(positions[21]);
	tempcoords.push(positions[20]);
	tempcoords.push(positions[19]);
	createMasking(maskcanvas, tempcoords);

	/*document.body.appendChild(newcanvas);
	document.body.appendChild(videocanvas);
	document.body.appendChild(maskcanvas);
	debugger;*/

	// do poisson blending
	Poisson.load(newcanvas, videocanvas, maskcanvas, function() {
		var result = Poisson.blend(30, 0, 0);
		// render to canvas
		newcanvas.getContext('2d').putImageData(result, 0, 0);
		// get mask

		var maskname = Object.keys(masks)[currentMask];
		fd.load(newcanvas, pos, pModel);
		requestAnimFrame(drawMaskLoop);
	});
}

function drawMaskLoop() {
	// get position of face
	positions = ctrack.getCurrentPosition();
	
	/*for (var i = 0;i < positions.length;i++) {
		positions[i][1] += 1;
	}*/

	overlayCC.clearRect(0, 0, 400, 300);
	if (positions) {
		// draw mask on top of face
		fd.draw(positions);
	}
	animationRequest = requestAnimFrame(drawMaskLoop);
}

function createMasking(canvas, modelpoints) {
	// fill canvas with black
	var cc = canvas.getContext('2d');
	cc.fillStyle="#d69cb8";
	cc.fillRect(0,0,canvas.width, canvas.height);
	cc.beginPath();
	cc.moveTo(modelpoints[0][0], modelpoints[0][1]);
	for (var i = 1;i < modelpoints.length;i++) {
		cc.lineTo(modelpoints[i][0], modelpoints[i][1]);
	}
	cc.lineTo(modelpoints[0][0], modelpoints[0][1]);
	cc.closePath();
	cc.fillStyle="#ffffff";
	cc.fill();
}