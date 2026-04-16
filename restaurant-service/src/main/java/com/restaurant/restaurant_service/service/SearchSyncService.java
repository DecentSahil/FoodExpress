package com.restaurant.restaurant_service.service;

import com.restaurant.restaurant_service.entity.MenuItem;
import com.restaurant.restaurant_service.entity.MenuItemDocument;
import com.restaurant.restaurant_service.repository.MenuItemRepository;
import com.restaurant.restaurant_service.repository.search.MenuItemSearchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchSyncService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemSearchRepository menuItemSearchRepository;

    @Transactional
    public void reindexMenuItems() {

        // 1️⃣ delete all search data
        menuItemSearchRepository.deleteAll();

        // 2️⃣ fetch available menu items
        List<MenuItem> menuItems = menuItemRepository.findByAvailableTrue();

        // 3️⃣ convert to document
        List<MenuItemDocument> documents = menuItems.stream()
                .map(item -> {
                    MenuItemDocument doc = new MenuItemDocument();

                    doc.setId(item.getId().toString());
                    doc.setName(item.getName());
                    doc.setDescription(item.getDescription());
                    doc.setPrice(item.getPrice());
                    doc.setVeg(item.isVeg());
                    doc.setAvailable(item.isAvailable());
                    doc.setRestaurantId(item.getRestaurant().getId().toString());
                    doc.setCategoryId(item.getCategory().getId().toString());
                    doc.setProductImage(item.getProductImage());
                    doc.setRestaurantName(item.getRestaurant().getName());
                    doc.setCategory(item.getCategory().getCategoryName());

                    return doc;
                })
                .toList();

        // 4️⃣ save to elasticsearch
        menuItemSearchRepository.saveAll(documents);
    }
}