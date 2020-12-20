import Swal from 'sweetalert2';

const alert = (type, text) => {
  const manifestInfo = chrome.runtime.getManifest();
  Swal.fire({
    title: manifestInfo.name,
    icon: type,
    html: text,
  });
};

export const confirm = (text) => {
  return Swal.fire({
    title: 'Tem certeza?',
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Sim, remover!`,
    cancelButtonText: `Não`,
  });
};

export const error = (text) => {
  alert('error', text);
};
