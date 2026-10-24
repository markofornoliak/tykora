export function downloadText(name:string,text:string,mime='application/json;charset=utf-8'):void{
 const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.style.display='none';document.body.appendChild(anchor);anchor.click();anchor.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export async function readSmallJson(file:File,maxBytes=100_000):Promise<unknown>{
 if(file.size>maxBytes)throw new Error('Файл превышает допустимый размер.');
 return JSON.parse(await file.text()) as unknown;
}
