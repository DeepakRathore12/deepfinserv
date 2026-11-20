/** Input masks shared by forms. */
export const digitsOnly = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);

export const formatRupeeInput = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  return d ? Number(d).toLocaleString('en-IN') : '';
};

export const toRupees = (v: string) => Number(String(v).replace(/\D/g, '')) || 0;
