/*
 * PatentCrawl combined line and point system
 * @author Ivo Rivetta - http://ivorivetta.com/
 * Borrowed heavily from :three.js webgl - buffergeometry drawcalls - by fernandojsg
 * @license: MIT / http://opensource.org/licenses/MIT
 */

    // global variables
    var renderer, scene, group;
    var camera;
    var orbit;
    var timerStart = Date.now();

    var r = 10; // Bounding Length
    var rHalf = r / 2;
    // global ps, ls
    var ps;
    var positions, colors;
    var maxParticleCount;
    var particleCount = 150; //?
    // global ls
    var ls;
    var lpositions, lcolors;
    var maxLineCount;
    var lineCount;
    // Animation
    var effectController = {
        minDistance: 1.5
    };

        // Interaction
    var raycaster, intersects;
    var threshold = 0.5;
    var mouse, INTERSECTED; 
    var indPOI = [];
    var cntHover = 0;

    // Attributes probs
            var particles;
            var pointCloud;
            var particlePositions;
            var linesMesh;
            var particlesData =[];
            var c = 0;

    function brains() {
        init();
        animate();
    }

    function init() {

        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        group = new THREE.Group();
        scene.add( group );
        // create a render, sets the background color and the size
        renderer = new THREE.WebGLRenderer( { antialias: true });
        renderer.setClearColor(0x0000000, 0.5);
        // renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

       	// create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        camera.position.x = 10;
        camera.position.y = 10;
        camera.position.z = 10;
        camera.lookAt(scene.position);
        // camera controls
        orbit = new THREE.OrbitControls(camera);

        // ps and ls
        make();

        // Interaction
            raycaster = new THREE.Raycaster();
            raycaster.params.Points.threshold = threshold;
            mouse = new THREE.Vector2();

        // ls
        // setupLineSystem(ps);

        // Stats object
        // addStatsObject();

        // Render out
        // add the output of the renderer to the html element
        // document.body.appendChild(renderer.domElement);
        document.getElementsByClassName("bg3JS")[0].appendChild(renderer.domElement);

        window.addEventListener( 'resize', onWindowResize, false );
            document.addEventListener( 'mousemove', onDocumentMouseMove, false );
            document.addEventListener( 'mouseup', onDocumentMouseDown, false );
            document.addEventListener( 'mousedown', onDocumentMouseUp, false );

        // call the render function
        render();
    }

    function dummyCloudGeometry() {
        // console.log('frv');
        // debugger;
        var nTotal = 8510;   // Datapoints
        maxParticleCount = particleCount;
        // Points per layer
        var layerSizes = [150,787,1790,2807,2976];
        var nLayer = layerSizes.length;   // qt of years
        // while (layerSizes.length < nLayer) {
        //     layerSizes.push(nTotal/nLayer);
        // }

        // Radii per layer
        var layerRadii = [];
        var count = 0;
        while (layerRadii.length < nLayer) {
            layerRadii.push(
                2.6 * (layerSizes[count]/365)^.5);
            count++;

        }

        /////////////////
        // Density?
        /////////////////

        var geometry = new THREE.Geometry();
        // Axes
        geometry.vertices.push(
                    new THREE.Vector3( 1 , 0, 0 ),
                    new THREE.Vector3( 0 , 1, 0 ),
                    new THREE.Vector3( 0, 0 , 1)
                    );

        /////////////////////////////////////
        // Circles
        // for (var i=0; i < nLayer; i++) {
        //     var radius = layerRadii[i];
        //     var segments = layerSizes[i];
        //     var circleGeometry = new THREE.CircleGeometry( radius, segments );

        //     for (var j=0; j<circleGeometry.vertices.length; j++) {
        //         circleGeometry.vertices[j].z = -i*2;
        //         geometry.vertices.push(circleGeometry.vertices[j]);
        //     }
        // };
        /////////////////////////////////////

        /////////////////////////////////////
        // Squares
            var maxLength = 12;
            var maxPoints = Math.max(...layerSizes);
            // var density = 50; // Constant Density
            // var scaleFactor =  (mass / density)^.5;
            // debugger;
        for (var i=0; i < nLayer; i++) {
            var nPoints = layerSizes[i];

            // var scaleLength = (maxLength^2 / (nPoints / nTotal) )^.5; // This is wrong?
            var scaledLength = nPoints / maxPoints * maxLength; //1 + 1 / 60 * i
            // points/edge
            var lpoints = Math.floor(Math.sqrt(nPoints));
            // debugger;
            // Built w/ x|y
            for (var xAxis=0; xAxis < lpoints; xAxis++) {
                for (var yAxis=0; yAxis < lpoints; yAxis++){
                    geometry.vertices.push(
                        new THREE.Vector3(
                            xAxis / lpoints * scaledLength,
                            -i*2,
                            yAxis / lpoints * scaledLength))
                }        
            }
        };
        /////////////////////////////////////

        /////////////////////////////////////
        // Make Morph targets
        // Zero
        for (var i=0; i < geometry.vertices.length; i++) {
            geometry.morphTargets.push(new THREE.Vector3(0,0,0));
        };


        // debugger;
        return geometry  
    };

    function make() {
        // Load Data
        var geometry = dummyCloudGeometry();

        // Setup bounds
        r = 7
        // ps
        particlePositions = new Float32Array( maxParticleCount * 3 );
        // ls
        maxLineCount = 2000;
        positions = new Float32Array( maxLineCount * 3 * 2);
        colors = new Float32Array( maxLineCount * 3 * 2);

        // var pSize = [];
        // var pOpacity = [];
        // var pJitterEffect = [];

        ////////////////////////////
        // Particle Geometry
        particles = new THREE.BufferGeometry();
        
        for ( var i = 0; i < maxParticleCount; i++ ) {

                    var x = Math.random() * r - r / 2;
                    var y = Math.random() * r - r / 2;
                    var z = Math.random() * r - r / 2;

                    particlePositions[ i * 3     ] = x;
                    particlePositions[ i * 3 + 1 ] = y;
                    particlePositions[ i * 3 + 2 ] = z;

                    // add it to the geometry
                    particlesData.push( {
                        velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
                        numConnections: 0
                    } );
                    particlesData.push( {
                        velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
                        numConnections: 0
                    } );
                    // debugger;
                    particlesData[i].velocity.multiplyScalar(0.009);

                }

        particles.addAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setDynamic( true ) );

        // Particle Material
        var pMaterial = new THREE.PointsMaterial( {
                    color: 0xFFFFFF,
                    size: 1,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    sizeAttenuation: false
                } );

        particles.setDrawRange( 0, particleCount );

        // make ps
        particleCount = 200;
        particles.setDrawRange( 0, particleCount );
        ps = new THREE.Points( particles, pMaterial );
        group.add( ps)

        

        /////////////
        // ls
        var lg = new THREE.BufferGeometry();
        // debugger;

        // 8610 edges is crashing webgl!! dropped size from 72M to 20
        lg.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setDynamic( true ) );
        lg.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );

        lg.computeBoundingSphere();

        // //ls material
        var lmaterial = new THREE.LineBasicMaterial( {
            vertexColors: THREE.VertexColors,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        lineCount = 2000;
        lg.setDrawRange( 0, lineCount );
        linesMesh = new THREE.LineSegments( lg, lmaterial );
        group.add( linesMesh );


        ///////////////
        // Helper

        var helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) ) );
                helper.material.color.setHex( 0x080808 );
                helper.material.blending = THREE.AdditiveBlending;
                helper.material.transparent = true;
        group.add( helper );
        // geometry.colors = [];   //replace colors here

        // // Custom Attributes
        // // add vertex specific color, size and opacity
        // var qtVertices = geometry.vertices.length;
        // for (var i = 0; i < qtVertices; i++) {
        //         geometry.colors.push(new THREE.Color(Math.random(), 0.5, 0.7));

        //         pSize.push(Math.random());

        //         pOpacity.push(Math.random() / 4 + 0.5);

        //         pJitterEffect.push(1);

        // }

        //line test in same geometry
        // - Line system should be at the end...
        // pOpacity.splice( 0, 4, 1, 1, 1, 1);
        // pSize.splice( 0, 4, 1, 1, 1, 1);
        // pJitterEffect.splice( 0, 4, 0, 0, 0, 0);

        // // define the attributes that get sent to the shader
        // // there should be an attribute for each individual vertex
        // var attributes = {
        //     pSize: {type: 'f', value: pSize},
        //     pOpacity: {type: 'f', value: pOpacity},
        //     pJitterEffect: {type: 'f', value: pJitterEffect}
        // };

        // // we'll get the basic shader stuff, so we don't have to define all the uniforms oursevles
        // // set all the configuration for the shader here. These apply to all vertices
        // var basicShader = THREE.ShaderLib['points'];
        // var uniforms = THREE.UniformsUtils.merge([basicShader.uniforms]);

        // var loader = new THREE.TextureLoader();
        // loader.load(
        //     '../PatentCrawl/assets/textures/ps_smoke.png',
        //     function ( texture ) { uniforms['map'].value = texture }
        //     );
        // // uniforms['map'].value = THREE.ImageUtils.TextureLoader().load("../PatentCrawl/assets/textures/ps_smoke.png");
        // uniforms['size'].value = 100;
        // uniforms['opacity'].value = 0.5;
        // uniforms['psColor'].value = new THREE.Color(0xffffff);
        // //Ivo added for Animation
        // uniforms['uTime'] = { type: "f", value: 1.0 };
        // uniforms['uEffectAmount'] = { type: "f", value: 0.0 };

        // Create a shadermaterial and add our shaders and our attributes and uniforms
        // var psMat2 = new THREE.PointsMaterial({
        //     // attributes: attributes,
        //     // uniforms: uniforms,
        //     transparent: true,
        //     // morphTargets: false,
        //     blending: THREE.AdditiveBlending,
        //     // vertexShader: document.
        //     //         getElementById('VertexShader').text,
        //     // fragmentShader: document.
        //             // getElementById('FragmentShader').text
        // });

        // // Create a new particle system based on the provided geometry
        // // and provided shader material
        // ps = new THREE.Points(geometry, psMat2);
        // ps.sortParticles = true;
        // ps.name = 'ps';
        // // add the particle system to the scene
        // scene.add(ps);



        // position it in the middle
        // ps.position.x -= x / 20;
        // ps.position.z -= x / 20;

        


    }

function setupLineSystem(ps) {

 // From points in cloud
    var lvertexPositions = [];
    for (var i = 0; i < 3; i++) {
        lvertexPositions.push(
            ps.geometry.vertices[i].x,
            ps.geometry.vertices[i].y,
            ps.geometry.vertices[i].z);
    };

    // Store in buffer
    var lvertices = new Float32Array( lvertexPositions.length * 3 );
    for (var i = 0; i < lvertexPositions; i++) {
        lvertices[ i*3 + 0] = lvertexPositions[i][0];
        lvertices[ i*3 + 1] = lvertexPositions[i][1];
        lvertices[ i*3 + 3] = lvertexPositions[i][2];
    };

    // Make buffer geometry

    var lgBuff = new THREE.BufferGeometry();

    //positions?
    var positions, colors;
    var segments = 2;
    positions = new Float32Array( segments * 3);
    // /colors?
    colors = new Float32Array( segments * 3);

    lgBuff.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    lgBuff.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ));
    // .setDynamic( true )

    lgBuff.computeBoundingSphere();

    // lgBuff.setDrawRange( 0, 2 );

    // Make Material
    var lmaterial = new THREE.LineBasicMaterial( {
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        transparent: true
    } );

    linesMesh = new THREE.LineSegments( lgBuff, lmaterial );

    // lg.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    // var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    // var mesh = new THREE.Mesh( geometry, material );
    // Make material properties
    // debugger;

    //////// Old line
    var lg = new THREE.Geometry();
    for (var i = 0; i < 2; i++) {
        lg.vertices.push(ps.geometry.vertices[i])
    };

    // Make Material
    var lm = new THREE.ShaderMaterial({
        // color: 0xffffff,
        linewidth: 5,
        opacity: 0.5,
        // vertexShader: document.
        //             getElementById('VertexShader').text,
        // fragmentShader: document.
        //     getElementById('FragmentShader').text
    });

    var ls = new THREE.Line( lg, lm );
    ls.name = "ls"
    scene.add(ls)
    //////////

}




function animate() {     
    // requestAnimationFrame( animate );
    var vertexpos = 0;
    var colorpos = 0;
    var numConnected = 0;

    for ( var i = 0; i < particleCount; i++ )
        particlesData[ i ].numConnections = 0;

    for ( var i = 0; i < particleCount; i++ ) {

        for (var dot in indPOI) {
            if (indPOI[dot] === i) {
                particlePositions[ i * 3     ] = 0;
                particlePositions[ i * 3 + 1 ] = 0;
                particlePositions[ i * 3 + 2 ] = 0;
                indPOI.splice(dot,1)
                // console.log('moved', i)
            }
        }
        // get the particle
        var particleData = particlesData[i];

        particlePositions[ i * 3     ] += particleData.velocity.x;
        particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
        particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

        if ( particlePositions[ i * 3 + 1 ] < -rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
            particleData.velocity.y = -particleData.velocity.y;

        if ( particlePositions[ i * 3 ] < -rHalf || particlePositions[ i * 3 ] > rHalf )
            particleData.velocity.x = -particleData.velocity.x;

        if ( particlePositions[ i * 3 + 2 ] < -rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
            particleData.velocity.z = -particleData.velocity.z;

        // if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
        //     continue;


        // Check collision
        for ( var j = i + 1; j < particleCount; j++ ) {

            var particleDataB = particlesData[ j ];
            // if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
            //     continue;



            var dx = particlePositions[ i * 3     ] - particlePositions[ j * 3     ];
            var dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
            var dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
            var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );



            if ( dist < effectController.minDistance ) {

                particleData.numConnections++;
                particleDataB.numConnections++;

                var alpha = 1.0 - dist / effectController.minDistance;

                positions[ vertexpos++ ] = particlePositions[ i * 3     ];
                positions[ vertexpos++ ] = particlePositions[ i * 3 + 1 ];
                positions[ vertexpos++ ] = particlePositions[ i * 3 + 2 ];

                positions[ vertexpos++ ] = particlePositions[ j * 3     ];
                positions[ vertexpos++ ] = particlePositions[ j * 3 + 1 ];
                positions[ vertexpos++ ] = particlePositions[ j * 3 + 2 ];

                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;

                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;

                numConnected++;
            }
        }
    }


    linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    ps.geometry.attributes.position.needsUpdate = true;
    
    render();
};

function render() {

    var time = Date.now() * 0.001;

    // Update group animations
    group.rotation.y = time * 0.1;
    // debugger;
    // scene.getObjectByName('ps').material.uniforms.uTime.value += 0.05;
    // scene.getObjectByName('ps').material.uniforms.uEffectAmount.value = 1.0;

    orbit.update();
    //stats.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);



        oneTimeCheck();
    }

    // calls the init function when the window is done loading.


function oneTimeCheck(){
            oneTimeCheck = Function("");
        }

function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

function onDocumentMouseMove( event ) {

                event.preventDefault();

                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        
        // // controls.enabled = true;
        // var timerStart2 = Date.now();
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( scene.children, true );
        // console.log('intersects ' , intersects);
        // console.log('raycast took: ', Date.now()-timerStart2 )


        if ( intersects.length > 0 ) {

            for (var dot in intersects) {
                indPOI.push(intersects[dot].index)
            }

            cntHover +=1;
            var lb = 100;
            var ub = 200;
            if (cntHover>lb && cntHover < ub) {
                // appear
                document.getElementById("intro").style.opacity = 1;
                
            } else if (cntHover>ub) {
                // disappear
                document.getElementById("intro").style.opacity = 0;
                document.getElementById("menuBar").style.opacity = 1;


            } else if (cntHover>(ub+1)) {
                // rm intro
                // document.body.removeChild(document.getElementsByID("intro")[0]);
            }
            // indPOI = intersects[ 0 ].index;
            
            // debugger;
            
            // var indexPOI = intersects[ 0 ].object.indHeight;
            // console.log('indexPOI ' , indexPOI);
            // console.log('Lat , long , elevation')
            // console.log(data.elevation[indexPOI])
            // // intersects[ 0 ].object.geometry.vertices
            // // console.log('intersects[ 0 ].object.geometry.vertices ' , intersects[ 0 ].object.geometry.vertices);
            // // console.log('intersects[ 0 ].object.scale.y ' , intersects[ 0 ].object.scale.y);
            // console.log('intersects[ 0 ].object.height ' , intersects[ 0 ].object.height);
            // // var elevationToVirtScale = data.elevation[indexPOI][2] / intersects[ 0 ].object.height ;
            
            // console.log('totalLength (virt height) = ', totalLength)

            // box.rows
            // console.log('topo.rows ' , topo.rows);

            // Get height from bounding box
            // var bbox = new THREE.Box3().setFromObject(intersects[ 0 ].object);
            // console.log('bbox ' , bbox.max.y , bbox.min.y);
            // console.log('bbox scale ' , data.elevation[indexPOI][2]/bbox.max.y/150 , bbox.min.y);


            // intersects[ 0 ].object
            // console.log('intersects[ 0 ].object ' , intersects[ 0 ].object);

            // console.log('')
        //     //Toggle or new check
        //     if ( indPOISelected.indexOf(POI) == -1) {
        //         // new
        //         indPOISelected.push(intersects[ 0 ].index);
        //         console.log("indPOISelected:", indPOISelected)
        //         // debugger;
        //     } else {
        //         // Exists, toggle off
        //         indPOISelected.splice(indPOISelected.indexOf(POI), 1)
        //         console.log('toggled off')
        //     }
        } else  { 
        //     // Nothing if clicking in empty space
        }
        // // debugger;
        // // document.body.container.style.cursor = 'auto';
        

            }

function onDocumentMouseDown( event ) {

        event.preventDefault();


    }

function onDocumentMouseUp( event ) {

        event.preventDefault();

    }

window.onload = init;