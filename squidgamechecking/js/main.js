
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


renderer.setClearColor(0xb7c3f3,1);

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );


// global variables

const start_position = 3;
const end_position = -start_position;
const text = document.querySelector(".text");
const TIME_LIMIT = 10;
let gameStat = "loading";
let isLookingBackward = true;

function createCube(size, positionX, rotY, color=0xfbc851){
	const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
	const material = new THREE.MeshBasicMaterial( { color: color } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.x = positionX; 
	cube.rotation.y =  rotY;
	scene.add( cube );
	return cube;


}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

// To Delay doll rotation
function delay(ms){
	return new Promise(resolve=> setTimeout(resolve, ms));
}

class Doll{
	constructor(){
	loader.load("./models/scene.gltf", (gltf) => {
	scene.add(gltf.scene);
	gltf.scene.scale.set(0.4,0.4,0.4);
	gltf.scene.position.set(0,-1,0);
	this.doll = gltf.scene;
	// animate();
})
	}
	lookBackward(){
		// this.doll.rotation.y = -3.15;
		gsap.to(this.doll.rotation,{y:-3.15,duration:.45})
		setTimeout(() => isLookingBackward = true , 150)
	}

	lookForward(){
		gsap.to(this.doll.rotation,{y:0,duration:.45})
		setTimeout(() => isLookingBackward = false , 450)

	}

	async start(){
		this.lookBackward()
		await delay((Math.random()* 1000)+1000);
		this.lookForward()
		await delay((Math.random()* 750)+750);
		this.start() // to call again recursively
	}

}


function createTrack(){
	createCube({w:start_position*2+.2, h:1.5, d:1},0, 0, 0xe5a716).position.z=-1;
	createCube({w:.2, h:1.5, d:1},start_position, -.35);
	createCube({w:.2, h:1.5, d:1},end_position, .35);
}


// calling Function of cube
createTrack();


class Player{
	constructor(){
		const geometry = new THREE.SphereGeometry( .3, 32, 16 );
		const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
		const sphere = new THREE.Mesh( geometry, material );
		sphere.position.z=1; // to maker the sphere appear over the doll
		sphere.position.x = start_position;
		scene.add( sphere );
		this.player = sphere;
		this.playerInfo = {
			positionX: start_position,
			velocity: 0
		}
	}

	run(){
		this.playerInfo.velocity = .03;
	}

	stop(){
		// this.playerInfo.velocity = 0;
		gsap.to(this.playerInfo,{
			velocity:0,
			duration:0.2
		})
	}

	check(){
		if(this.playerInfo.velocity >0 && !isLookingBackward){
			// alert("You Lose!");
			text.innerText = "You Lose!";
			document.getElementById("btn").style.visibility = "visible"; 

			gameStat="over";
		}
		if(this.playerInfo.positionX < end_position+.4){
			// alert("You Win!");
			text.innerText = "You Win!";
			document.getElementById("btn").style.visibility = "visible"; 
			gameStat="over";
		}
	}


	update(){
		this.check();
		this.playerInfo.positionX -= this.playerInfo.velocity;
		this.player.position.x = this.playerInfo.positionX;
	}
}


// calling player function
const player = new Player();
// calling function of Doll
let doll = new Doll();

// To start Game
async function init(){
	await delay(1000);
	text.innerText = "Get";
	await delay(1000);
	text.innerText = "Set";
	await delay(1000);
	text.innerText = "Go!!";
	startGame();
}


function startGame(){
	gameStat = "started"
	let progressBar = createCube({w:5,h:.1,d:1},0,0);
	progressBar.position.y = 3.35;
	gsap.to(progressBar.scale,{x:0, duration: TIME_LIMIT, ease:"none"});
	doll.start();
	setTimeout(()=>{
		if(gameStat != "over"){
			text.innerText = "You ran out of Time!";
			gameStat = "over";
			document.getElementById("btn").style.visibility = "visible"; 
		
		}
	},TIME_LIMIT * 1000)
}




init();

// renderer.render(scene,camera);

// function to call repeatedly
function animate() {
	if (gameStat=="over") return
	renderer.render( scene, camera );
	player.update(); // to update the positiono of sphere
	// console.log('hello world');
	// cube.rotation.x += 0.01;
	requestAnimationFrame( animate );
}
animate();



// To make responsive with the window size
window.addEventListener( 'resize' , onWindowResize , false);

function onWindowResize(){
	console.log("resize function enters");
	camera.aspect = window.innerWidth/ window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth,window.innerHeight);
}

// For key Press Handling
window.addEventListener('keydown', (e)=>{
	// alert(e.key)
	if(gameStat!="started") return
	if(e.key== "ArrowUp" ){
		player.run();
	}
})


window.addEventListener('keyup', (e)=>{
	// alert(e.key)
	if(e.key== "ArrowUp" ){
		player.stop();
	}
})