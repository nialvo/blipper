document.addEventListener("DOMContentLoaded", () => {

async function voldetect(){
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const audioContext = new AudioContext();
  const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
  const analyserNode = audioContext.createAnalyser();
  mediaStreamAudioSourceNode.connect(analyserNode);

  const pcmData = new Float32Array(analyserNode.fftSize);
  const onFrame = () => {
    analyserNode.getFloatTimeDomainData(pcmData);
    let sumSquares = 0.0;
    for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
    vals.vol = Math.sqrt(sumSquares / pcmData.length)
    document.getElementById("volume").innerText = Math.round(vals.vol*100000)/100000;
    window.requestAnimationFrame(onFrame);
  };
  window.requestAnimationFrame(onFrame);

}

voldetect();




const para = {
  temp: 156,
  late: 0,
  deca: 5,
  sens: 5,
  pens: 10,
  freq: 156,
  dura: 24
}

const vals = {
  vol:0,
  curr_vol:0,
  curr_note:0
}

document.getElementById("temp").textContent = para.temp;
document.getElementsByName("temp")[0].value = para.temp;
document.getElementById("late").textContent = para.late;
document.getElementsByName("late")[0].value = para.late;
document.getElementById("deca").textContent = para.deca;
document.getElementsByName("deca")[0].value = para.deca;
document.getElementById("sens").textContent = para.sens;
document.getElementsByName("sens")[0].value = para.sens;
document.getElementById("pens").textContent = para.pens;
document.getElementsByName("pens")[0].value = para.pens;
document.getElementById("freq").textContent = para.freq;
document.getElementsByName("freq")[0].value = para.freq;
document.getElementById("dura").textContent = para.dura;
document.getElementsByName("dura")[0].value = para.dura;



const inst = new Instrument();
//inst.setTimbre({ wave: "piano" });

const sa=[0,4,7,11,14,17,21,24,28,31,35,38,41,45,48,52,55,59,62,65,69,72,69,65,62,59,55,52,48,45,41,38,35,31,28,24,21,17,14,11,7,4,0,4,7,11,14,17,21,24,28,31,35,38,41,45,48,52,55,59,62,65,69,72,69,65,62,59,55,52,48,45,41,38,35,31,28,24,21,17,14,11,7,4,0]
const sb=[7,0,-5,0,7,12,19,24,-12,-5,-17,-5,7,0,7,-5,7,0,12,-12,24,-24,7,0,-5,0,7,12,19,24,-12,-5,-17,-5,7,0,7,-5,7,0,12,-12,24,-24,7,0,-5,0,7,12,19,24,-12,-5,-17,-5,7,0,7,-5,7,0,12,-12,24,-24,7,0,-5,0,7,12,19,24,-12,-5,-17,-5,7,0,7,-5,7,0,12,-12,24,-24]
const sc=[7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24,0,7,12,19,24]

function blip(N,style,vol) {

 let inter= (60/para.temp)*1000
  /*
  console.log(style.length)
  let c=0;
  let k=Math.min(para.dura,style.length)
  
  while(c<para.dura){
    let t = c*inter+para.late*10;
    let n = style[c];
    let co = 5/(5+c*para.deca);
    setTimeout(
      () => inst.tone(-N-n,1,co),
      t
      
    );
    c++;

  }
  */

  setTimeout(
    () => inst.tone(-N,1,vol),
    2000
  );


  
}




function updatePitch(analyserNode, detector, input, sampleRate) {
  analyserNode.getFloatTimeDomainData(input);
  const [pitch, clarity] = detector.findPitch(input, sampleRate);

  document.getElementById("pitch").textContent = `${Math.round(pitch * 10) / 10} Hz`;
  
  if(clarity>=(1-para.pens/100)&&vals.vol>(.1-(para.sens/100))){//if there is loud and clear input
    let v = vals.vol
    let x = v+1;
    let y = x-1;
    let note = autotunerMidi(pitch)//get closest midi note
    

    if (note!=vals.curr_note){//if this is a new note play it
      blip(note,sc,v);
      vals.curr_note=note
    }else if (v>vals.curr_vol){//if this is the same note repeated play it
      blip(note,sc, v);
    }
    
    vals.curr_vol=y//set current volume
  }
  
  

  document.getElementById("clarity").textContent = `${Math.round(
    clarity * 100
  )} %`;
  window.setTimeout(
    () => updatePitch(analyserNode, detector, input, sampleRate),
    60000/para.freq
  );
}


const audioContext = new window.AudioContext();
  const analyserNode = audioContext.createAnalyser();

  document
    .getElementById("resume-button")
    .addEventListener("click", () => audioContext.resume());

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext.createMediaStreamSource(stream).connect(analyserNode);
    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
    const input = new Float32Array(detector.inputLength);
    updatePitch(analyserNode, detector, input, audioContext.sampleRate);
  });







var slider = document.getElementById("sliders");

slider.oninput = function (e) {
  document.getElementById(e.target.name).textContent = e.target.value;
  para[e.target.name] = e.target.value;
}

});

/*
// Play a single tone immediately.  Tones may be also specified
// numerically (in Hz), or with midi numbers (as negative integers).
inst.tone('C')

// Whenever we like, release the note.
setTimeout(function() {
  inst.tone('C', false);
  firstsong();
}, Math.random() * 10000);

function firstsong() {
  // Play "Mary Had a Little Lamb"
  inst.play({tempo:200},
      "AGFG|AAA2|GGG2|AAA2|AGFG|AAAA|GGAG|F4|z4", whendone)
}

// Do this after Mary is done.
function whendone() {
  // Play "Stairway", which picks out a few chords.
  inst.setTimbre({wave:'sawtooth', gain:0.15,
      attack:0.008, decay:0.2, release:0.2,
      cutoff:0, cutfollow:20, resonance:3});
  inst.play("F^Gcf|[gE]c^G|g[^g^D]c|^G^g[dD]|" +
             "^AFd|[^C=c]^GF|^G21/3c^GF|[G^DG,][F,F^G][^GFF,]2z4", whendone2);
}

// Do this after Stairway is done.
function whendone2() {
  // Change the inst to sound more like a piano.
  inst.setTimbre({wave:"piano"});
  // Then play a couple bars of a Beethoven Sonata, using ABC notation
  // clipped from the web.  Note support for chords, beats, accidentals,
  // key signatures, meter and tempo markings, ties, and so on.
  inst.play(
    "X:2\n" +
    "T:8th Sonata for inst\n" +
    "%%staves {1 2}\n" +
    "C:L. van Beethoven\n" +
    "M:C\n" +
    "L:1/16\n" +
    "Q:1/8=66\n" +
    "F:http://richardrobinson.tunebook.org.uk/tune/6525\n" +
    "K:Cm\n" +
    "V:1\n" +
    "!fp![E,4G,4C4]- [E,3/G,3/C3/]!3![G,/C/]!4![G,3/=B,3/D3/]!5![G,/C/E/] " +
    "([=A,4C4E4]!4![=B,2D2])z2|\\n" +
    "!fp!!3![=B,4D4F4]- [B,3/D3/F3/][B,/D/F/][B,3/D3/G3/][B,/D/A/] " +
    "([B,4D4A4]!3![C2E2G2])z2|\n" +
    "V:2\n" +
    "[C,,4E,,4G,,4C,4]- [C,,3/E,,3/G,,3/C,3/]!2!E,/!3!D,3/!4!C,/ " +
    "(!2!^F,4G,2)z _A,,|\\n" +
    "_A,4-A,3/!2!A,/!1!G,3/=F,/ E,4-E,2z2|\n"
  );
}

*/