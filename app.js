import { apiGetProducts,apiGetCategories } from "./utils/routes.js";
import { queryParams } from './utils/functions.js';

// filtros como constantes globales
const dataObject = {
    search:'',
    page:0,
    category:0,
    order:0,
}

// función para traer los productos por medio de fetch la funcion queryParams es un helper el cual combierte nuesto objecto en parametros GET 
const getProduct = (data) =>{   
    let params = '';
    if(dataObject.search != '' || dataObject.page > 0 || dataObject.category > 0 || dataObject.order > 0) params = '?'+queryParams(data) 
    fetch(apiGetProducts+params)
    .then(response => response.json())
    .then(data => {
        if(data.code != 500)
        {
            generateListProduct(data.items)
            generatePagination(data.total_items)
            dataObject.page = data.page;
        }
    })
    .catch(err=>console.log(err))
}

// función para traer las categorias por medio de fetch
const getCategories = () =>{
    fetch(apiGetCategories)
    .then(response => response.json())
    .then(data => {
        if(data.code != 500)
        {
            generateListCategories(data.items)
        }
    })
    .catch(err=>console.log(err))
}

// función para pintar el listado de productos
const generateListProduct = (data) =>{
    let element = document.getElementById('list-products')
    element.innerHTML = '';
    if(data.length > 0)
    {
        data.map((item) => {
        element.innerHTML   +=  `<div class="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12 mb-3">
                                    <div class="card">
                                        <img style="min-height:304px;height:304px;" src="${item.url_image ? item.url_image:'assets/productdefault.jpg'}" class="card-img-top img-fluid" alt="${item.url_image ? item.url_image:'productdefault.jpg'}">
                                        <div class="card-body">
                                            <h5 class="card-title" title="${item.name}">${item.name}</h5>
                                            <div class="row row align-items-center">
                                                <div class="col-md-6">
                                                <p class="card-text">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}</p>
                                                </div>
                                                <div class="col-md-6 text-end">
                                                <a href="#" class="btn shopping-button rounded-pill"><i class="fas fa-shopping-cart"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
        })
    }
    else{
        element.innerHTML   += `<div class="col-md-12 text-center"><p>Sin resultados</p></div>`
    }
}

// función para pintar el listado de categorias
const generateListCategories = (data) => {
    let element = document.getElementById('list-categories')
    element.innerHTML = '';
    data.map((item) => {
        element.innerHTML += `<li><a href="#" class="filter-category ${item.id == dataObject.category ? 'active':''}" data-id="${item.id}">${item.name} <i class="fa fa-chevron-right icon-list-category float-right mt-2"></i></a></li>`;
    })
}

// función para crear y pintar la paginacion
const generatePagination = (paginatorSize) =>{
    let element = document.getElementById('paginate-products')
    let perpage = 9;
    let totalPages = Math.ceil(paginatorSize/perpage);
    let pageCurrent = parseInt(dataObject.page);
    let pageTarget = 0;
    element.innerHTML = '';
    if(pageCurrent != 0) element.innerHTML += `<li class="page-item"><a class="page-link" data-page="${pageCurrent - perpage}" href="#">Anterior</a></li>`;
    for (let page = 1; page <= totalPages; page ++) {
        element.innerHTML += `<li class="page-item ${pageCurrent == pageTarget ? 'active':''}"><a class="page-link" data-page="${pageTarget}" href="#">${page}</a></li>`;
        pageTarget +=perpage;
    }
    if(pageCurrent + perpage < paginatorSize) element.innerHTML +=`<li class="page-item"><a class="page-link" data-page="${pageCurrent + perpage}" href="#">Siguiente</a></li>`;
}

// función para obtener los parametros de la URL
const getURLParameters = url =>(url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce((k, v) => ((k[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), k),
{});

// función para reestablcer los filtros
const resetFilters = () =>{
    dataObject.search = ''
    dataObject.page = 0
    dataObject.category =0
    dataObject.order = 0
}

// función de seteo de la constante global con los parametros de la URL
const setFilters = (e) => {
    resetFilters()
    let url = window.location.href;
    let urlParams = getURLParameters(url);
    if(Object.keys(urlParams).length != 0)
    {
        let search = urlParams.search;
        let page = parseInt(urlParams.page);
        let category = parseInt(urlParams.category);
        let order = parseInt(urlParams.order);
        if(search) dataObject.search = search;
        if(!isNaN(page)) dataObject.page = page;
        if(category) dataObject.category = category;
        if(order) dataObject.order = order;
        document.getElementById('orderProduct').value = order ? order:'';
        document.getElementById('search').value = search ? search:'';
    }
    let elements = document.querySelectorAll('.filter-category')
    for (let index = 0; index < elements.length; index++) {
        if(elements[index].getAttribute('data-id') == dataObject.category)
        elements[index].classList.add('active');
        else elements[index].classList.remove('active')
    }
}

// Inicialización de la app
window.onload = () => {
    setFilters()
    getProduct(dataObject)
    getCategories()
}

// Escucha cada vez que existe un cambio en la URL por medio del #, la finalidad es poder mostrar los parametros en la URL sin tener que refrescar la página
window.addEventListener('hashchange',()=>{
    setFilters()
    getProduct(dataObject)
})

// función de manejo de eventos del DOM
const on = (element, event, selector, handler) => {
    element.addEventListener(event,e => {
        if(e.target.closest(selector)){
            handler(e);
        }
    })
}

// Haciendo uso de la función de manejo de eventos del DOM 
on(document, 'click', '.filter-category',e => {
    e.preventDefault();
    let category = e.target.getAttribute('data-id');
    window.location = '#?category='+ category;
})
on(document, 'click', '#paginate-products .page-item',e => {
    e.preventDefault();
    let page = e.target.getAttribute('data-page');
    let params = '';
    if(dataObject.search != '' && dataObject.search != null){
        params = '#?page='+ page + '&search='+dataObject.search;
    }
    else if(dataObject.category != '' && dataObject.category != 0 && dataObject.order == '' || dataObject.order == 0){
        params = '#?page='+ page + '&category='+dataObject.category;
    }
    else if(dataObject.order != '' && dataObject.order != 0 && dataObject.category == 0 || dataObject.category == ''){
        params = '#?page='+ page + '&order='+dataObject.order;
    }else if(dataObject.order != '' && dataObject.order != 0 && dataObject.category != 0 && dataObject.category != ''){
        params = '#?page='+ page + '&order='+dataObject.order+'&category='+dataObject.category;
    }else{
        params = '#?page='+ page;
    }
    window.location = params;
    
})
on(document, 'change', '#orderProduct',e => {
    e.preventDefault();
    let order = e.target.value;
    let params = '';
    if(dataObject.category != '' && dataObject.category != 0)
    {
        params = '#?order='+ order + '&category='+dataObject.category;

    }else{
        params = '#?order='+ order;
    }    
    window.location = params;
})

// Escucha al evento submit del formulario 
formSearch.addEventListener('submit', (e)=>{
    e.preventDefault();
    let search = document.getElementById('search').value
    window.location = '#?search='+ search;
})
