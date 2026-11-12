import { useEffect, useRef, useState } from 'react';

type Status = 'idle'|'checking'|'current'|'available'|'updating'|'failed'|'unsupported';

export function usePwa(flush: () => Promise<void>) {
  const [status,setStatus] = useState<Status>('idle');
  const [deferred,setDeferred] = useState(false);
  const registration = useRef<ServiceWorkerRegistration|null>(null);
  const flushRef = useRef(flush);
  const busy = useRef(false);
  const reload = useRef(false);
  const timer = useRef<number|undefined>(undefined);
  useEffect(()=>{flushRef.current=flush;},[flush]);
  useEffect(()=>{
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let live = true;
    const watching = new Set<ServiceWorker>();
    function available() { if(live){setStatus('available');setDeferred(false);} }
    function watch() {
      const reg=registration.current;
      if(reg?.waiting)available();
      const worker=reg?.installing;
      if(!worker || watching.has(worker))return;
      watching.add(worker);
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed' && navigator.serviceWorker.controller)available();
        if(worker.state==='redundant' && live)setStatus('failed');
      });
    }
    function changed() {
      if(reload.current) {
        void flushRef.current().then(()=>location.reload()).catch(()=>{reload.current=false;busy.current=false;setStatus('failed');});
      } else if(live && navigator.serviceWorker.controller) {
        // Another tab accepted the worker. This tab keeps control of its reload.
        available();
      }
    }
    const hadController=Boolean(navigator.serviceWorker.controller);
    let firstClaim=!hadController;
    const controllerChanged=()=>{if(firstClaim){firstClaim=false;return;}changed();};
    navigator.serviceWorker.addEventListener('controllerchange',controllerChanged);
    void navigator.serviceWorker.register(new URL('sw.js',new URL(import.meta.env.BASE_URL,location.href)),{updateViaCache:'none'}).then(reg=>{
      if(!live)return;
      registration.current=reg;reg.addEventListener('updatefound',watch);watch();
    }).catch(()=>{if(live)setStatus('failed');});
    return ()=>{live=false;navigator.serviceWorker.removeEventListener('controllerchange',controllerChanged);registration.current?.removeEventListener('updatefound',watch);window.clearTimeout(timer.current);};
  },[]);
  async function check() {
    if(busy.current)return;
    const reg=registration.current;
    if(!reg){setStatus('unsupported');return;}
    busy.current=true;setStatus('checking');setDeferred(false);
    try {await reg.update();setStatus(reg.waiting?'available':reg.installing?'checking':'current');}
    catch {setStatus('failed');} finally {busy.current=false;}
  }
  async function update() {
    if(busy.current)return;
    busy.current=true;setStatus('updating');setDeferred(false);
    try {
      // Let the immediate progress surface paint before a very fast activation.
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
      await flushRef.current();
      const worker=registration.current?.waiting;
      if(!worker){location.reload();return;}
      reload.current=true;
      timer.current=window.setTimeout(()=>{reload.current=false;busy.current=false;setStatus('failed');},15000);
      worker.postMessage({type:'SKIP_WAITING'});
    } catch {reload.current=false;busy.current=false;setStatus('failed');}
  }
  return {status,deferred,check,update,defer:()=>setDeferred(true),build:__APP_BUILD__};
}
