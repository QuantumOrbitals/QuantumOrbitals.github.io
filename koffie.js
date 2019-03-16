import * as algebrite from '/algebrite.js'; //type="module"
import * as OrbitControls from '/OrbitControls.js';

var container, camera, scene, renderer, controls;
var geometry, material, mesh;

var n_g = 3;
var l_g = 2;
var m_g = 0;

var MAX_POINTS = 10000;
//var bounds = 0.5;
var bounds = 1;
var a = 1;

var scale = 30;
//var intensity = "5000";
var brightest = 0.0;
var brightness = 0;
var n_alpha = 0;
var contrast = 1;
//var intensity = "10000";
var size = 6;
var colour = 'white';

var complex = true;
var phase;

var vertices;
var opacities;
var _opacities;
var intensities;
var _intensities;
var colours;

var orbitals;
var waveFunction;
var PDF;

function onWindowResize(){
    let container = document.getElementById("renderer");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );
}

function golden_experience()
{
    let qsliders = document.querySelectorAll(".qnumber");
    let qvalues = document.querySelectorAll(".qoutput");
    
    for(let i = 0; i < qsliders.length; i++)
    {
        qvalues[i].innerHTML = qsliders[i].value;
    }
    
    for(let i = 0; i < qsliders.length; i++)
    {
        qsliders[i].oninput = e => {
            if(qsliders[1].value >= qsliders[0].value)
                qsliders[1].value = qsliders[0].value - 1;
            if(qsliders[2].value > qsliders[1].value)
                qsliders[2].value = qsliders[1].value;
            qvalues[0].innerHTML = qsliders[0].value;
            qvalues[1].innerHTML = qsliders[1].value;
            qvalues[2].innerHTML = qsliders[2].value;
        }
    }
    
    let sliders2 = document.querySelectorAll(".slider2");
    let values2 = document.querySelectorAll(".output2");
    
    document.getElementById("p_slider").onchange = e => {
        MAX_POINTS = document.getElementById("p_slider").value;
        updateAmount();
    }
    
    document.getElementById("p_slider").addEventListener('input', function() {
        document.getElementById("o_particles").innerHTML = document.getElementById("p_slider").value;
    }, false);
    
    document.getElementById("c_slider").addEventListener('input', function() {
        document.getElementById("o_contrast").innerHTML = document.getElementById("c_slider").value;
        contrast = document.getElementById("c_slider").value;
    }, false);
    
    document.getElementById("b_slider").addEventListener('input', function() {
        document.getElementById("o_brightness").innerHTML = document.getElementById("b_slider").value;
        brightness = document.getElementById("b_slider").value;
    }, false);
    
    document.getElementById("nodes_slider").oninput = e => {
        n_alpha = document.getElementById("nodes_slider").value;
    }
    
    document.getElementById("nodes_slider").addEventListener('input', function() {
        document.getElementById("o_nodes").innerHTML = document.getElementById("nodes_slider").value;
        n_alpha = document.getElementById("nodes_slider").value;
    }, false);
    
    document.getElementById("c_checkbox").addEventListener('change', function() {
        if(document.getElementById("c_checkbox").checked)
        {
            complex = true;
        }
        else
        {
            complex = false;
        }
        updateComplex();
    }, false);
    
    document.getElementById("a_checkbox").addEventListener('change', function() {
        if(document.getElementById("a_checkbox").checked)
        {
            setAxes();
        }
        else
        {
            removeAxes();
        }
    }, false);
    
    document.getElementById("s_slider").onchange = e => {
        scale = document.getElementById("s_slider").value;
        updatePoints();
    }
    
    document.getElementById("s_slider").addEventListener('input', function() {
        document.getElementById("o_scale").innerHTML = document.getElementById("s_slider").value;
    }, false);
    
    let apply = document.getElementById("Apply");
    apply.onclick = e => {
        let MAX_POINTS = document.getElementById("p_slider").value;
        n_g = document.getElementById("n_slider").value;
        l_g = document.getElementById("l_slider").value;
        m_g = document.getElementById("m_slider").value;
        
        document.getElementById("menu").style.opacity = "0";
        document.getElementById("menu").style.visibility = "hidden";
        document.getElementById("onscreen").style.opacity = "0.1";
        document.getElementById("onscreen").style.visibility = "visible";
        
        init();
        
        document.getElementById("renderer").style.opacity = "1";
        console.log("...done!");
        
        animate();
    }
    
    let change = document.getElementById("Change");
    change.onclick = e => {
        location = location; //javascript is zo raar
    }
}

window.onload = function scoopdiwhoop()
{
    window.addEventListener( 'resize', onWindowResize, false );
    
    golden_experience();
    
    console.log("here we gooo");
}

var symbols = ['+', '-', '*', '/', '^', '(', ')'];

function circumflexToPow(s) //don't judge me
{
    for(let i = 0; i < s.length; i++)
        if(s[i] == '^')
        {
            let base;
            let exponent;
            let range = [];
            if(s[i-1] == ')')
            {
                let counter = 1;
                let end = i-1;
                let j = 2;
                while(counter && (i-j) > -1)
                {
                    if(s[i-j] == ')')
                        counter++;
                    else if(s[i-j] == '(')
                        counter--;
                    j++;
                }
                if(symbols.indexOf(s[i-j]) == -1)
                    while(symbols.indexOf(s[i-j]) == -1 && (i-j) > -1)
                        {
                            j++;
                        }
                let start = i-j+1;
                range[0] = start;
                base = s.slice(start, end+1);
            }
            else
            {
                let end = i-1;
                let j = 1;
                while(symbols.indexOf(s[i-j]) == -1 && (i-j) > -1)
                {
                    j++;
                }
                let start = i-j+1;
                range[0] = start;
                base = s.slice(start, end+1);
            }
            
            if(s[i+1] == '(')
            {
                let counter = 1;
                let start = i+1;
                let j = 2;
                while(counter)
                {
                    if(s[i+j] == ')')
                        counter--;
                    else if(s[i+j] == '(')
                        counter++;
                    j++;
                }
                let end = i+j-1;
                range[1] = end;
                //console.log(start + " " + end + "bazinga");
                exponent = s.slice(start, end+1);
            }
            else
            {
                let start = i+1;
                let j = 1;
                while(symbols.indexOf(s[i+j]) == -1 && i+j < s.length)
                {
                    j++;
                }
                let end = i+j-1;
                range[1] = end;
                //console.log(start + " " + end);
                exponent = s.slice(start, end+1);
            }
            let sutandopowah = "Math.pow(" + base + ", " + exponent + ")";
            s = s.substr(0, range[0]) + sutandopowah + s.substr(range[1]+1, s.length);
            i = range[0]+sutandopowah.length;
        }
    return s;
}

function a_laguerre(_n_)
{
    //let a_laguerre_ = "e^(x)/((_n_)!)*(d(e^(-x)*x^(_n_), x, _n_))";
    let a_laguerre_ = "e^(x)*(d(e^(-x)*x^(_n_), x, _n_))"; //_n_! is weggelaten, omdat de plot anders veel te klein wordt
    a_laguerre_ = a_laguerre_.replace(/_n_/g, _n_);
    a_laguerre_ = Algebrite.simplify(a_laguerre_).toString();
    console.log(a_laguerre_);
    return a_laguerre_;
}

function laguerre(_k, _n)
{
    _n=_n+_k;
    console.log(_n);
    let laguerre_ = "(-1)^(_k)*(d(a_l, x, _k))";
    laguerre_ = laguerre_.replace(/a_l/g, a_laguerre(_n));
    laguerre_ = laguerre_.replace(/_k/g, _k);
    laguerre_ = Algebrite.simplify(laguerre_).toString();
    laguerre_ = laguerre_.replace(/x/g, "(r*2/(n*a))");
    console.log(laguerre_);
    return laguerre_;
}

function radialWave(n, l)
{
    let radial = "sqrt((2/(a*n))^3*((n-l-1)!)/(2*n*((n+l)!)^3))*e^(-r/(a*n))*(2*r/(a*n))^l*(L_l)";
    radial = radial.replace(/L_l/g, laguerre(2*l+1, n-1-l));
    radial = radial.replace(/n/g, n);
    radial = radial.replace(/l/g, l);
    radial = radial.replace(/a/g, a);
    radial = Algebrite.simplify(radial).toString();
    console.log(radial);
    return radial;
}

function polynomial(l)
{
    let polynomial_ = "1/(2^l*l!)*(d(((x^2-1)^l), x, abs(l)))";
    polynomial_ = polynomial_.replace(/l/g, l);
    console.log(polynomial_);
    polynomial_ = Algebrite.simplify(polynomial_).toString();
    console.log(polynomial_);
    return polynomial_;
}

function legendre(l, m)
{
    let legendre_ = "(1-(x)^2)^(m_/2)*(d(p_, x, abs(m)))";
    legendre_ = legendre_.replace("p_", polynomial(l));
    legendre_ = legendre_.replace(/m_/g, Algebrite.abs(m));
    legendre_ = legendre_.replace(/l/g, l);
    legendre_ = legendre_.replace(/m/g, m);
    legendre_ = Algebrite.simplify(legendre_).toString();
    console.log(legendre_);
    return legendre_;
}

function sphericalHarmonics(l, m)
{
    let spherical = "(-1)^m*sqrt(((2*l+1)/(4*pi))*((l-m)!/(l+m)!))*(" + legendre(l, m) + ")*(e^(i*m*y))";
    spherical = spherical.replace(/l/g, l);
    spherical = spherical.replace(/m/g, m);
    
    console.log(spherical);
    spherical = Algebrite.simplify(spherical).toString();
    console.log(spherical);
    return spherical;
}

function compileFunction(f){
    f = f.replace(/exp/g, "Math.E^");
    f = f.replace(/abs/g, "Math.abs");
    
    f = f.replace(/cos/g, "Math.cos");
    f = f.replace(/sin/g, "Math.sin");
    f = f.replace(/tan/g, "Math.tan");
    
    f = f.replace(/arcMath.cos/g, "Math.acos");
    f = f.replace(/arcMath.sin/g, "Math.asin");
    f = f.replace(/arcMath.tan/g, "Math.atan");
    
    f = f.split("arg(r)").join("((r < 0)? " + Math.PI + " : 0)");
    f = f.split("arg(x)").join("((x < 0)? " + Math.PI + " : 0)");

    f = f.split("r").join("(r)");
    f = f.split("x").join("(Math.cos(θ))");
    f = f.split("y").join("(φ)");
    f = f.split("pi").join(Math.PI);
    f = f.replace(/Math.e/g, "Math.E");
    
    f = circumflexToPow(f);
    
    return f;
}

function calcWaveFunction(n, l, m)
{
    if(complex && m == 0)
        complex = false;
    
    let total = "(" + radialWave(n, l) + ")*(" + sphericalHarmonics(l, m) + ")";
    total = total.replace("*-", "*(-1)*");
    total = Algebrite.simplify(total).toString();
    
    waveFunction = total.replace(/exp/g, "e^");
    
    console.log(waveFunction);
    if(complex)
    {
        let complex_wave = Algebrite.simplify("(" + waveFunction + ")" + "*(conj(" + waveFunction + "))").toString();
        PDF = complex_wave;
        
        //let phase_eq = Algebrite.simplify(Algebrite.arctan(Algebrite.imag(waveFunction)/Algebrite.real(waveFunction))).toString();
        let phase_eq = Algebrite.simplify(Algebrite.arg(waveFunction)).toString();
        console.log(Algebrite.real(waveFunction).toString());
        console.log(Algebrite.imag(waveFunction).toString());
        console.log(phase_eq);
        phase = compileFunction(phase_eq);
        console.log(phase);
    }
    else
    {
        let real_wave = Algebrite.simplify("(" + Algebrite.real(total).toString() + ")" + "^2").toString();
        PDF = real_wave;
    }
    
    PDF = compileFunction(PDF);
    
    console.log(PDF);
}

function getAlpha(r, theta, phi)
{
    let f = PDF;
    f = f.replace(/r/g, r);
    f = f.replace(/θ/g, theta);
    f = f.replace(/φ/g, phi);
    
    let g = 0;
    
    if(complex && m_g != 0)
    {
        g = phase;
        g = g.replace(/r/g, r);
        g = g.replace(/φ/g, phi);
        g = g.replace(/θ/g, theta);
    }
    
    let _alpha_ = [eval(f), eval(g)];
    return _alpha_;
}

function calcOpacity(x, y, z)
{
    let r = Math.sqrt(x*x+y*y+z*z);
    let theta = Math.acos(z/r);
    let phi = Math.atan(y/x) + Math.PI;
    let _alpha_ = getAlpha(r, theta, phi);
    
    return _alpha_;
}

function createPoints()
{
    let points = [];
    let alphas = [];
    let colours_ = [];
    let fightthepowah;
    let i = MAX_POINTS;
    while(i)
    {
        var x = bounds*(Math.random() - 1/2);
        var y = bounds*(Math.random() - 1/2);
        var z = bounds*(Math.random() - 1/2);
        if ( Algebrite.sqrt(x*x + y*y + z*z) < bounds/2 )
        {   
            points.push(x);
            points.push(y);
            points.push(z);
            
            let alpha = calcOpacity(x*scale, y*scale, z*scale);
            alphas.push(alpha[0]);
            let s = new THREE.Color();
            let hue = (alpha[1])/Math.PI + 0.5;
            //console.log(hue);
            s.setHSL(hue, 1, 0.5);
            
            colours_.push(s.toArray()[0]);
            colours_.push(s.toArray()[1]);
            colours_.push(s.toArray()[2]);
            (alpha[0] > brightest) && (brightest = eval(alpha[0]));
            i--;
        }
    }
    //console.log(points);
    vertices = new Float32Array(points);
    opacities = new Float32Array(alphas);
    intensities = new Float32Array(MAX_POINTS).fill(brightest);
    colours = new Float32Array(colours_);
    //console.log(opacities);
    //console.log(brightest);
}

var textMesh = [];
var axes;
function setAxes() {
    var material = new THREE.LineBasicMaterial({
        color: "rgb(100,100,100)",
        linewidth: 1
    });
    
    var geometry = new THREE.Geometry();
    
    let a_size = bounds*0.75;
    geometry.vertices.push(
        new THREE.Vector3(a_size, 0, 0),
        new THREE.Vector3(-a_size, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, a_size, 0),
        new THREE.Vector3(0, -a_size, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, a_size),
        new THREE.Vector3(0, 0, -a_size)
    );
    
    axes = new THREE.Line(geometry, material);
    scene.add(axes);
    
    var loader = new THREE.FontLoader();
    
    loader.load( 'CMU Serif_Roman.json', function ( font ) {
        var textGeo = new THREE.TextGeometry( 'x', {
            font: font,
            size: 0.05*bounds,
            height: 0 
        });
        
        var textGeo = new THREE.TextGeometry( 'y', {
            font: font,
            size: 0.05*bounds,
            height: 0 
        });
        
        var textGeo = new THREE.TextGeometry( 'z', {
            font: font,
            size: 0.05*bounds,
            height: 0 
        });
        
        var textMat = new THREE.MeshBasicMaterial({
            color: "rgb(100,100,100)"
        })
        
        var coord = ['x', 'y', 'z'];
        var coord_pos = [
            new THREE.Vector3(a_size*0.94, -0.015*bounds, 0.015*bounds + 0.05*bounds),
            new THREE.Vector3(-0.015*bounds, a_size*0.94, 0.015*bounds + 0.05*bounds),
            new THREE.Vector3(-0.015*bounds, -0.015*bounds, a_size + 0.05*bounds),
        ];
        for(let i = 0; i < 3; i++)
        {
            var textGeo = new THREE.TextGeometry( coord[i], {
                font: font,
                size: 0.05*bounds,
                height: 0 
            });
            
            textMesh[i] = new THREE.Mesh(textGeo, textMat);

            scene.add(textMesh[i]);
            textMesh[i].position.set(coord_pos[i].x, coord_pos[i].y, coord_pos[i].z);
        }
    });
}

function removeAxes()
{
    for(let i = 0; i < textMesh.length; i++)
        scene.remove(textMesh[i]);
    scene.remove(axes);
}

function updateAxes() {
    for(let i = 0; i < textMesh.length; i++)
    {
        textMesh[i].rotation.x = camera.rotation.x;
        textMesh[i].rotation.y = camera.rotation.y;
        textMesh[i].rotation.z = camera.rotation.z;
        //textMesh[i].lookAt(camera.position);
        //camera.target.position.copy(textMesh[i]);
    }
}

function setupScene() {
	camera = new THREE.PerspectiveCamera( 45, container.clientWidth / container.clientHeight, 0.01, 150 );
    camera.up.set( 0, 0, 1 );
	camera.position.x = 1.3;
	camera.position.y = 1.3;
	camera.position.z = 1.3;
	scene = new THREE.Scene();
    scene.background = null;
    setAxes();
}

function calcPoints() {
    calcWaveFunction(n_g, l_g, m_g);
    createPoints();
}

function createGeometry() {
    geometry = new THREE.BufferGeometry();
    
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'c_color', new THREE.BufferAttribute( colours, 3 ) );
    geometry.addAttribute('alpha', new THREE.BufferAttribute(opacities,1));
    geometry.addAttribute('max', new THREE.BufferAttribute(intensities,1));
    //console.log(colours);
    
    let contrast_ = new Float32Array(MAX_POINTS).fill(contrast);
    geometry.addAttribute('contrast', new THREE.BufferAttribute(contrast_,1));
    
    let sizes = new Float32Array(MAX_POINTS).fill(size);
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes,1));
    
    let di_molto = new Float32Array(MAX_POINTS).fill(brightness);
    geometry.addAttribute('brightness', new THREE.BufferAttribute(di_molto,1));
    
    let dummy = new Float32Array(MAX_POINTS).fill(0);
    geometry.addAttribute('n_alpha', new THREE.BufferAttribute(dummy,1));
}

function createMaterial() {
    
    let uniforms =
    {
        color1: { value: new THREE.Color( 0xffffff ) },
        color2: { value: new THREE.Color( 0xFF0000 ) },
        complex: {
            value: (complex?true:false)
        }
    };
    
	material = new THREE.ShaderMaterial(
        {
            depthWrite: false,
            vertexColors: THREE.VertexColors,
            uniforms: uniforms,
            //blending: THREE.AdditiveBlending,
            vertexShader:   document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
            transparent: true
        });
}

function createOrbital() {
    calcPoints();
    createGeometry();
    createMaterial();
    
    orbitals = new THREE.Points(geometry,material);
	scene.add(orbitals);
    
    var bright = orbitals.geometry.attributes.brightness;
    bright.dynamic = true;
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.sortObjects = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( container.clientWidth, container.clientHeight );
	container.appendChild( renderer.domElement );
    
    controls = new THREE.OrbitControls( camera, renderer.domElement );
}

function init() {
    container = document.getElementById("renderer");
    
    setupScene();
    createOrbital();
    setupRenderer();
}

function updateAmount(){
    scene.remove(orbitals);
    createOrbital();
}

function updatePoints(){
    for(let i = 0; i < MAX_POINTS; i++)
    {
        let x = orbitals.geometry.attributes.position.array[3*i];
        let y = orbitals.geometry.attributes.position.array[3*i+1];
        let z = orbitals.geometry.attributes.position.array[3*i+2];
        
        orbitals.geometry.attributes.alpha.array[i] = calcOpacity(x*scale, y*scale, z*scale)[0];
        orbitals.geometry.attributes.alpha.needsUpdate = true;
    }
}

function updateComplex(){
    calcWaveFunction(n_g, l_g, m_g);
    orbitals.material.uniforms.complex.value = complex;
    orbitals.material.uniforms.complex.needsUpdate = true;
    
    updatePoints();
}

function updateAlpha()
{
    var brightness_ = orbitals.geometry.attributes.brightness.array;
    var _contrast = orbitals.geometry.attributes.contrast.array;
    var nodes_alpha = orbitals.geometry.attributes.n_alpha.array;
    nodes_alpha.fill(n_alpha);
    brightness_.fill(brightness);
    _contrast.fill(contrast);
    orbitals.geometry.attributes.contrast.needsUpdate = true;
    orbitals.geometry.attributes.brightness.needsUpdate = true;
    orbitals.geometry.attributes.n_alpha.needsUpdate = true;
}

function sortPoints(mesh) {

    var vector = new THREE.Vector3();

    // Model View Projection matrix

    var matrix = new THREE.Matrix4();
    matrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
    matrix.multiply( mesh.matrixWorld );

    //

    var geometry = mesh.geometry;

    var index = geometry.getIndex();
    var positions = geometry.getAttribute( 'position' ).array;
    var length = positions.length / 3;

    if ( index === null ) {

        var array = new Uint16Array( length );

        for ( var i = 0; i < length; i ++ ) {

            array[ i ] = i;

        }

        index = new THREE.BufferAttribute( array, 1 );

        geometry.setIndex( index );

    }

    var sortArray = [];

    for ( var i = 0; i < length; i ++ ) {

        vector.fromArray( positions, i * 3 );
        vector.applyMatrix4( matrix );

        sortArray.push( [ vector.z, i ] );

    }

    function numericalSort( a, b ) {

        return b[ 0 ] - a[ 0 ];

    }

    sortArray.sort( numericalSort );

    var indices = index.array;

    for ( var i = 0; i < length; i ++ ) {

        indices[ i ] = sortArray[ i ][ 1 ];

    }

    geometry.index.needsUpdate = true;

}

function animate()
{
	requestAnimationFrame( animate );
    
    updateAlpha();
    updateAxes();
    
    orbitals.material.needsUpdate = true;
    sortPoints(orbitals);
    
	renderer.render( scene, camera );
    controls.update();
    
}