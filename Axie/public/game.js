var socket = io();
var myAxie = {};
var axies = {};
var movement = {
    up: false,
    down: false,
    right: false,
    left: false
};
var gameReady = false;
let type = "WebGL"
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas"
}
PIXI.utils.sayHello(type)

//Create a Pixi Application
let app;
app = new PIXI.Application(800, 600, { backgroundColor: 0xffffff /*,  transparent: true*/ });
app.view.id = "canvas";
app.view.style.height = 480;
app.view.style.border = "1px solid #d9d9d9";

//Add the canvas that Pixi automatically created for you to the HTML document
function init() {
    document.body.appendChild(app.view);
}


socket.on('idSent', function (data) {
    fetchNewAxie(400, 300, function (_axie) {
        var item = {
            coordinates: data.coordinates,
            axie: _axie
        };
        axies[data.id] = item;
        myAxie = axies[data.id].axie;
        socket.emit('axieLoaded');
    });
});
socket.on('loadOtherPlayers', function (_axies) {
    delete _axies[socket.id];
    var axieArray = Object.keys(_axies).map(function (key) {
        return {
            id: key,
            x: _axies[key].x,
            y: _axies[key].y
        };
    });
	var itemCount = 0;
	if (axieArray.length === 0) {
		setInterval(function () { updateAxieMovement(); }, 1000 / 60);
		gameReady = true;
	}
    axieArray.forEach(function (axieData) {
        fetchNewAxie(axieData.x, axieData.y, function (_axie) {
            itemCount++;
            if (_axie !== false) {
                var item = {
                    coordinates: {x : axieData.x, y : axieData.y},
                    axie: _axie
                };
                axies[axieData.id] = item;
            }
            if (itemCount === axieArray.length) {
                setInterval(function () { updateAxieMovement(); }, 1000 / 60);
                gameReady = true;
            }
        });
    });
});
socket.on('message', function (data) {
    console.log(data);
    //socket.emit('echo1', 'This is an echo');
});
socket.on('newPlayer', function (data) {
    fetchNewAxie(400, 300, function (_axie) {
        var item = {
            coordinates: data.coordinates,
            axie: _axie
        };
        axies[data.id] = item;
    });
});

function updateAxieMovement() {
    //console.log('update');
    if (gameReady)
        socket.emit('updateAxieMovement', movement);
}

socket.on('updatedAxieMovement', function (coordinates) {
    var coordinateArray = Object.keys(coordinates).map(function (key) {
        return {
            id: key,
            x: coordinates[key].x,
            y: coordinates[key].y
        };
    });
    coordinateArray.forEach(function (coordinate) {
        if (gameReady) {
            axies[coordinate.id].axie.position.x = coordinate.x;
            axies[coordinate.id].axie.position.y = coordinate.y;
        }
    });
});
socket.on('userDisconnected', function (id) {
    app.stage.removeChild(axies[id].axie);
    delete axies[id];
});
app.start();


document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === 'b') {
        if (!myAxie.activeAnim) {
            myAxie.state.setAnimation(0, 'bite', false);
            myAxie.state.addAnimation(0, 'walking', true, 0);
        }
    }
    else if (keyName === 'ArrowRight') {
        myAxie.rotation += Math.PI / 37;
        console.log('rotation = ' + myAxie.rotation);
    }
    else if (keyName === 'ArrowLeft') {
        myAxie.rotation -= Math.PI / 37;
    }
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
        case 65: // A
            //myAxie.position.y += 10;
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

function fetchNewAxie(x, y, callback) {
    //if (id !== socket.id) {
	$.get({ url: "https://axieinfinity.com/api/axies/150" }, function (data, status, xhr) {
		if (data.stage < 3) {
			alert("This axie is either a larva or an egg.")
			return;
		}
		let imageName = "150" + ".png";
		//prevent using cache...AI servers have wonky CORS config.
		atlasURL = data["figure"]["atlas"];
		imageURL = data["figure"]["images"][imageName];
		modelURL = data["figure"]["model"];
		let breakCache = "?" + escape(new Date());
		atlasURL += breakCache;
		imageURL += breakCache;
		modelURL += breakCache;

		PIXI.loader.reset();
		PIXI.loader
			.add('axie_atlas', atlasURL)
			.add('axie_png', imageURL)
			.load(function (loader, resources) {
				//cache false to circumvent server's cors caching. server should use vary: origin ? or access-control-allow-origin: *
				$.get({ url: modelURL }, function (rawSkeletonData) {
					const rawAtlasData = resources['axie_atlas'].data; //your atlas file
					const spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, function (line, callback) {
						//use hash name instead of name from file
						callback(PIXI.BaseTexture.from('axie_png'));
					});
					const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
					const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);
					var spineData = spineJsonParser.readSkeletonData(rawSkeletonData);
					var newAxie = new PIXI.spine.Spine(spineData);
					//mirror image myAxie
					//myAxie.scale.x = -1;
					newAxie.scale.set(0.25, 0.25);
					newAxie.position.set(x, y);
					newAxie.pivot.set(-newAxie.width * newAxie.scale.x * 0.75, -newAxie.height * newAxie.scale.y * 2);
					newAxie.stateData.setMix("walking", "appearing", 0.2);
					newAxie.stateData.setMix("appearing", "walking", 0.2);
					newAxie.stateData.setMix("bite", "walking", 0.2);
					newAxie.stateData.setMix("walking", "bite", 0.2);
					if (newAxie.state.hasAnimation('idle')) {
						newAxie.state.setAnimation(0, 'idle', false);
					} else if (newAxie.state.hasAnimation('walking')) {
						newAxie.state.setAnimation(0, 'walking', false);
					}
					newAxie.state.addListener({
						start: function (entry) {
							//console.log('animation is set at ' + entry.trackIndex);
							newAxie.activeAnim = true;
						}
					})
					newAxie.state.addListener({
						complete: function (entry) {
							//console.log('animation ended at ' + entry.trackIndex);
							newAxie.activeAnim = false;
						}
					})
					newAxie.alpha = 1;
					//app.stage.removeChildren();
					app.stage.addChild(newAxie);
					//myAxie = newAxie;
					PIXI.spine.Spine.globalAutoUpdate = true;
					callback(newAxie);
				});
			});
        });
}