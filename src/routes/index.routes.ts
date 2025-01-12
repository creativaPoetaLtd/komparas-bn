import userRoutes from "./users/usersCrud.routes";
import loginRoutes from "./auth/login.routes";
import roleRoutes from "./users/userRole.routes"
import statusRoutes from "./users/userStatus.routes"
import categoriesRoutes from "./categories/categories.routes"
import productsRoutes from "./products/productsCrud.routes"
import productImageRoutes from "./products/productImage.routes"
import shopRoutes from "./shop/shop.routes"
import customerRoutes from "./customer/customer.routes"
import nativeProductsRoutes from "./products/nativeProducts.routes"
import comparisionRoutes from "./comparision/comparision.routes"
import DayphoneRoutes from "./products/offer.routes"
import applicationRouter from "./job/application.routes";
import adsRoutes from "./ads/ads.routes";

export default {
    userRoutes,
    loginRoutes,
    roleRoutes,
    statusRoutes,
    categoriesRoutes,
    productsRoutes,
    productImageRoutes,
    shopRoutes,
    customerRoutes,
    nativeProductsRoutes,
    comparisionRoutes,
    DayphoneRoutes,
    applicationRouter,
    adsRoutes
};
