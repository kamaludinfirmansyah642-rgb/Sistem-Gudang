let itemsCache = [];
let filter = '';
let currentPage = 1;
let pageSize = 10;
let sortKey = 'created_at';
let sortDir = 'desc';
let itemsTotal = 0;
let itemsTotalQuantity = 0;
let itemsLowStock = 0;
let itemsSupplierCount = 0;
let itemsTopItems = [];

const toastEl = document.getElementById('toast');
const statTotal = document.getElementById('statTotal');

function showToast(msg){
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(()=>toastEl.classList.remove('show'), 2500);
}

function setLoading(on){
  const count = document.getElementById('count');
  if(!count) return;
  count.innerHTML = on ? '<span class="loading"></span>' : `${itemsCache.length}/${itemsTotal} ditampilkan`;
}

async function fetchItems(){
  setLoading(true);
  const params = new URLSearchParams({ page: currentPage, pageSize, search: filter, sort: `${sortKey}:${sortDir}` });
  const res = await fetch('/api/items?' + params.toString());
  const data = await res.json();
  setLoading(false);
  return {
    items: data.items || [],
    total: data.total || 0,
    totalQuantity: data.totalQuantity || 0,
    lowStockCount: data.lowStockCount || 0,
    supplierCount: data.supplierCount || 0,
    topItems: data.topItems || []
  };
}

function formatDate(value){
  if(!value) return '-';
  const d = new Date(value);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

function render(){
  const list = document.getElementById('list');
  list.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(itemsTotal / pageSize));

  document.getElementById('count').textContent = `${itemsCache.length}/${itemsTotal} ditampilkan`;
  statTotal.textContent = itemsTotal;
  document.getElementById('statQuantity').textContent = itemsTotalQuantity;
  document.getElementById('statLow').textContent = itemsLowStock;
  document.getElementById('statSuppliers').textContent = itemsSupplierCount;
  drawStockChart(itemsTopItems);

  itemsCache.forEach(item => {
    const li = document.createElement('li');
    li.className = 'grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-100 p-6 shadow-sm transition duration-150 hover:-translate-y-1 hover:shadow-xl md:grid-cols-[1fr_auto]';

    const main = document.createElement('div');
    main.className = 'grid gap-4';

    const title = document.createElement('div');
    title.className = 'text-lg font-semibold text-slate-900';
    title.textContent = item.name;

    const sku = document.createElement('span');
    sku.className = 'inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700';
    sku.textContent = item.sku || 'SKU kosong';

    const location = document.createElement('span');
    location.className = 'inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700';
    location.textContent = item.location ? `Lokasi ${item.location}` : 'Lokasi tidak ditetapkan';

    const qty = document.createElement('span');
    qty.className = 'inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700';
    qty.textContent = `Qty ${item.quantity ?? 0}`;

    const footer = document.createElement('div');
    footer.className = 'flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-3';
    const created = document.createElement('span');
    created.textContent = `Terdaftar ${formatDate(item.created_at)}`;
    const badge = document.createElement('span');
    badge.className = `rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${item.quantity < 20 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`;
    badge.textContent = item.quantity < 20 ? 'Stok rendah' : 'Stok aman';

    footer.appendChild(created);
    footer.appendChild(badge);

    const metaRow = document.createElement('div');
    metaRow.className = 'flex flex-wrap gap-2 items-center';
    metaRow.appendChild(sku);
    metaRow.appendChild(location);
    metaRow.appendChild(qty);

    main.appendChild(title);
    main.appendChild(metaRow);
    main.appendChild(footer);

    const actions = document.createElement('div');
    actions.className = 'flex flex-wrap gap-3 items-center justify-end';
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.className = 'inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50';
    edit.onclick = () => startInlineEdit(li, item);

    const del = document.createElement('button');
    del.textContent = 'Hapus';
    del.className = 'inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700';
    del.onclick = async () => {
      if(!confirm('Hapus item ini?')) return;
      try{
        await fetch('/api/items/' + item.id, { method:'DELETE' });
        load();
        showToast('Item dihapus');
      }catch(e){ showToast('Gagal menghapus'); }
    };

    actions.appendChild(edit);
    actions.appendChild(del);
    li.appendChild(main);
    li.appendChild(actions);
    list.appendChild(li);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const el = document.getElementById('pagination');
  el.innerHTML = '';
  const prev = document.createElement('button');
  prev.textContent = '‹ Prev';
  prev.className = 'inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed';
  prev.disabled = currentPage <= 1;
  prev.onclick = ()=>{ if(currentPage>1){ currentPage--; load(); } };

  const info = document.createElement('div');
  info.className = 'text-sm text-slate-500';
  info.textContent = `Halaman ${currentPage} / ${totalPages}`;

  const next = document.createElement('button');
  next.textContent = 'Next ›';
  next.className = 'inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed';
  next.disabled = currentPage >= totalPages;
  next.onclick = ()=>{ if(currentPage<totalPages){ currentPage++; load(); } };

  el.appendChild(prev);
  el.appendChild(info);
  el.appendChild(next);
}

function startInlineEdit(li, item){
  li.innerHTML = '';
  li.className = 'rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm';

  const form = document.createElement('form');
  form.className = 'grid gap-4';

  const inputStyle = 'w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100';

  const nameInput = document.createElement('input');
  nameInput.value = item.name;
  nameInput.placeholder = 'Nama barang';
  nameInput.className = inputStyle;

  const skuInput = document.createElement('input');
  skuInput.value = item.sku || '';
  skuInput.placeholder = 'SKU';
  skuInput.className = inputStyle;

  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = '0';
  quantityInput.value = item.quantity ?? 0;
  quantityInput.placeholder = 'Kuantitas';
  quantityInput.className = inputStyle;

  const locationInput = document.createElement('input');
  locationInput.value = item.location || '';
  locationInput.placeholder = 'Lokasi';
  locationInput.className = inputStyle;

  const categoryInput = document.createElement('input');
  categoryInput.value = item.category || '';
  categoryInput.placeholder = 'Kategori';
  categoryInput.className = inputStyle;

  const supplierInput = document.createElement('input');
  supplierInput.value = item.supplier || '';
  supplierInput.placeholder = 'Supplier';
  supplierInput.className = inputStyle;

  const buttonRow = document.createElement('div');
  buttonRow.className = 'flex flex-wrap gap-3 items-center justify-end';

  const save = document.createElement('button');
  save.textContent = 'Simpan';
  save.className = 'inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800';
  save.type = 'button';

  const cancel = document.createElement('button');
  cancel.textContent = 'Batal';
  cancel.type = 'button';
  cancel.className = 'inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50';

  save.onclick = async () => {
    const name = nameInput.value.trim();
    if(!name) return showToast('Nama tidak boleh kosong');
    try{
      const payload = {
        name,
        sku: skuInput.value.trim(),
        quantity: Number(quantityInput.value) || 0,
        location: locationInput.value.trim(),
        category: categoryInput.value.trim(),
        supplier: supplierInput.value.trim()
      };
      await fetch('/api/items/' + item.id, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      load();
      showToast('Perubahan disimpan');
    }catch(e){ showToast('Gagal menyimpan'); }
  };

  cancel.onclick = () => load();
  buttonRow.appendChild(save);
  buttonRow.appendChild(cancel);

  form.appendChild(nameInput);
  form.appendChild(skuInput);
  form.appendChild(quantityInput);
  form.appendChild(locationInput);
  form.appendChild(categoryInput);
  form.appendChild(supplierInput);
  form.appendChild(buttonRow);
  li.appendChild(form);
}

async function load(){
  const res = await fetchItems();
  itemsCache = res.items;
  itemsTotal = res.total;
  itemsTotalQuantity = res.totalQuantity;
  itemsLowStock = res.lowStockCount;
  itemsSupplierCount = res.supplierCount;
  itemsTopItems = res.topItems;
  render();
}

document.getElementById('form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  if(!name) return showToast('Nama tidak boleh kosong');
  const sku = document.getElementById('sku').value.trim();
  const quantity = Number(document.getElementById('quantity').value) || 0;
  const location = document.getElementById('location').value.trim();
  const category = document.getElementById('category').value.trim();
  const supplier = document.getElementById('supplier').value.trim();
  try{
    await fetch('/api/items', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, sku, quantity, location, category, supplier }) });
    document.getElementById('form').reset();
    currentPage = 1;
    load();
    showToast('Barang ditambahkan');
  }catch(e){ showToast('Gagal menambahkan'); }
});

document.getElementById('search').addEventListener('input', (e)=>{ filter = e.target.value; currentPage = 1; load(); });
document.getElementById('sort').addEventListener('change', (e)=>{ const [k, d] = e.target.value.split(':'); sortKey = k; sortDir = d; currentPage = 1; load(); });
document.getElementById('pageSize').addEventListener('change', (e)=>{ pageSize = Number(e.target.value); currentPage = 1; load(); });
document.getElementById('exportButton').addEventListener('click', () => {
  const params = new URLSearchParams({ search: filter, sort: `${sortKey}:${sortDir}` });
  window.location = '/api/export?' + params.toString();
});

function drawStockChart(topItems){
  const container = document.getElementById('stockChart');
  container.innerHTML = '';
  if (!topItems || topItems.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'Tidak ada data untuk grafik';
    empty.style.color = '#475569';
    container.appendChild(empty);
    return;
  }

  const maxQty = Math.max(...topItems.map(item => item.quantity || 0), 1);
  topItems.forEach(item => {
    const row = document.createElement('div');
  row.className = 'grid gap-3 sm:grid-cols-[1fr_auto] items-center';

  const meta = document.createElement('div');
  meta.className = 'space-y-1';
  const label = document.createElement('div');
  label.className = 'text-sm font-semibold text-slate-900';
  label.textContent = `${item.name} (${item.sku || '-'})`;
  const qty = document.createElement('div');
  qty.className = 'text-xs text-slate-500';
  qty.textContent = `${item.quantity ?? 0} unit · ${item.location || 'Lokasi tidak ditetapkan'}`;
  meta.appendChild(label);
  meta.appendChild(qty);

  const track = document.createElement('div');
  track.className = 'h-3 overflow-hidden rounded-full bg-slate-200';
  const fill = document.createElement('div');
  fill.className = 'h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-400';
    track.appendChild(fill);

    row.appendChild(meta);
    row.appendChild(track);
    container.appendChild(row);
  });
}

load();
