/* Kinetica Studio v30 — ROM guide dialog, diagrams extracted from user-provided ROM PDFs. */
(()=>{'use strict';
const DATA = [["Back Extension and Flexion", "Move the trunk forward for flexion or backward for extension while the pelvis stays as steady as possible. The handout specifies a goniometer measurement, not the tape-measure method.", "Regular Anatomy ROM Lab · page 1"], ["Side Flexion", "Bend the trunk toward the selected side without turning the body. Compare the side-bent position with the upright starting position.", "Regular Anatomy ROM Lab · page 1"], ["Neck Extension and Flexion", "Tilt the head forward for flexion or backward for extension, limiting movement of the shoulders and upper trunk.", "Regular Anatomy ROM Lab · page 1"], ["Neck Lateral (Side) Bending", "Tilt the head toward the selected shoulder without turning the face or lifting the shoulder.", "Regular Anatomy ROM Lab · page 1"], ["Neck Rotation", "Turn the head toward the selected side while the shoulders and trunk remain facing forward.", "Regular Anatomy ROM Lab · page 1"], ["Hip Backward Extension", "Move the selected thigh backward relative to the pelvis, with the torso supported as illustrated. Avoid compensating with the lower back.", "Regular Anatomy ROM Lab · page 1"], ["Elbow Extension and Flexion", "Bend the elbow for flexion or straighten it for extension. Align the goniometer arms with the upper arm and forearm.", "Regular Anatomy ROM Lab · page 2"], ["Forearm Pronation and Supination", "Rotate the forearm palm-down for pronation or palm-up for supination while keeping the upper arm stable.", "Regular Anatomy ROM Lab · page 2"], ["Ankle Inversion and Eversion", "Tilt the sole inward for inversion or outward for eversion. Keep the lower leg steady during the movement.", "Regular Anatomy ROM Lab · page 2"], ["Ankle Plantarflexion and Dorsiflexion", "Point the toes away from the shin for plantarflexion or bring the toes toward the shin for dorsiflexion.", "Regular Anatomy ROM Lab · page 2"], ["Wrist Radial and Ulnar Deviation", "Move the hand sideways toward the thumb for radial deviation or toward the little finger for ulnar deviation, keeping the forearm still.", "Advanced ROM Lab · page 3"], ["Wrist Flexion and Extension", "Bend the wrist palmward for flexion or toward the back of the hand for extension. Stabilize the forearm.", "Advanced ROM Lab · page 3"], ["Thumb MCP Joint Flexion", "Bend the thumb at its metacarpophalangeal (MCP) joint—the thumb knuckle—while keeping the rest of the hand steady.", "Advanced ROM Lab · page 3"], ["Thumb IP Joint Flexion", "Bend the thumb at its interphalangeal (IP) joint, nearer the tip, without bending the thumb knuckle more than necessary.", "Advanced ROM Lab · page 3"], ["Hip Flexion", "Move the thigh toward the trunk. Capture the selected side with the knee either flexed or extended, as specified by the measurement.", "Advanced ROM Lab · page 3"], ["Hip Adduction", "Bring the selected leg toward the body’s midline while keeping the pelvis steady.", "Advanced ROM Lab · page 3"], ["Hip Abduction", "Move the selected leg outward away from the body’s midline while keeping the pelvis steady.", "Advanced ROM Lab · page 4"], ["Knee Flexion", "Bend the selected knee to bring the heel toward the thigh. Place the goniometer fulcrum at the knee and align the arms along the thigh and lower leg.", "Advanced ROM Lab · page 4"], ["Shoulder Adduction and Abduction", "Move the arm away from the side for abduction or toward the body for adduction. Keep the torso from leaning.", "Advanced ROM Lab · page 4"], ["Shoulder Flexion and Extension", "Raise the arm forward for flexion or move it backward for extension, as seen from a side view. Keep the torso steady.", "Advanced ROM Lab · page 4"]];
const $=id=>document.getElementById(id);
const dialog=document.createElement('dialog');
dialog.id='romGuideDialog';dialog.className='rom-guide-dialog';
dialog.setAttribute('aria-labelledby','romGuideTitle');
dialog.innerHTML=`<div class="rom-guide-header"><span class="rom-guide-overline">ROM REFERENCE</span><button type="button" class="rom-guide-close" aria-label="Close ROM guide" title="Close">×</button></div><div class="rom-guide-content"><h2 id="romGuideTitle"></h2><div class="rom-guide-slot" id="romGuideSlot"></div><div class="rom-guide-figure"><img id="romGuideImage" alt="" loading="eager" draggable="false"></div><p class="rom-guide-description" id="romGuideDescription"></p><p class="rom-guide-instruction">Use the illustration as a reference for positioning. Place the fulcrum at the appropriate joint axis and align the two goniometer arms with the moving and stationary segments. Follow your lab’s joint-specific measurement convention.</p><div class="rom-guide-source" id="romGuideSource"></div></div>`;
document.body.appendChild(dialog);
const close=()=>dialog.close();
dialog.querySelector('.rom-guide-close').addEventListener('click',close);
dialog.addEventListener('click',event=>{if(event.target===dialog)close()});
const slotNote=(text)=> {
  if (/^Left (?!Knee)/.test(text)) return 'Measure the left side.';
  if (/^Right (?!Knee)/.test(text)) return 'Measure the right side.';
  if (text.startsWith('Left Knee')) return 'Left hip; '+(text.includes('Flexed')?'keep the knee flexed.':'keep the knee extended.');
  if (text.startsWith('Right Knee')) return 'Right hip; '+(text.includes('Flexed')?'keep the knee flexed.':'keep the knee extended.');
  return '';
};
function open(key,fullLabel,slot) {
  const match=/^rom-(\d+)-(\d+)$/.exec(key);
  if(!match)return;
  const group=Number(match[1]);
  const data=DATA[group];if(!data)return;
  $('romGuideTitle').textContent=data[0];
  $('romGuideSlot').textContent=slot||fullLabel||'';
  $('romGuideDescription').textContent=data[1]+' '+slotNote(slot||'');
  $('romGuideSource').textContent='Illustration: '+data[2];
  const img=$('romGuideImage');img.src='./rom-guides/guide-'+String(group).padStart(2,'0')+'.png';
  img.alt='Measurement illustration for '+data[0]+' from the supplied '+data[2];
  if(!dialog.open)dialog.showModal();
}
window.KineticaROMGuide30=Object.freeze({open});
})();
