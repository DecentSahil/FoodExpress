package com.restaurant.restaurant_service.service;

import com.restaurant.restaurant_service.dto.MenuSearchRequest;
import com.restaurant.restaurant_service.entity.MenuItemDocument;
import org.springframework.data.domain.Page;

public interface MenuSearchService {

    Page<MenuItemDocument> search(MenuSearchRequest request);
}
