package com.restaurant.restaurant_service.controller;

import com.restaurant.restaurant_service.dto.MenuItemResponse;
import com.restaurant.restaurant_service.dto.MenuSearchRequest;
import com.restaurant.restaurant_service.entity.MenuItemDocument;
import com.restaurant.restaurant_service.service.MenuItemService;
import com.restaurant.restaurant_service.service.MenuSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/restaurant/public/menu")
public class PublicMenuController {

    private final MenuItemService menuItemService;

    private final MenuSearchService menuSearchService;

    @GetMapping("/search")
    public ResponseEntity<Page<MenuItemDocument>> searchMenu(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean veg,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        MenuSearchRequest req = new MenuSearchRequest(
                search, veg, minPrice, maxPrice,
                categoryId, page, size);

        return ResponseEntity.ok(menuSearchService.search(req));
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems() {

        return ResponseEntity.ok(menuItemService.getAllAvailableMenuItems());
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuByRestaurant(
            @PathVariable UUID restaurantId) {

        return ResponseEntity.ok(menuItemService.getMyMenu(restaurantId));
    }

    @GetMapping("/{restaurantId}/category/{categoryId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuByCategory(
            @PathVariable UUID restaurantId,
            @PathVariable UUID categoryId) {
        return ResponseEntity.ok(
                menuItemService.getMenuByCategory(restaurantId, categoryId));
    }

    // Temporary: re-syncs all DB menu items into Elasticsearch with productImage
    @GetMapping("/reindex-all")
    public ResponseEntity<String> reIndex() {
        menuItemService.reIndexAll();
        return ResponseEntity.ok("Re-indexing complete");
    }

    // Temporary: deletes all documents from Elasticsearch (DB untouched)
    @GetMapping("/delete-all-es")
    public ResponseEntity<String> deleteAllEs() {
        menuItemService.deleteAllFromElasticsearch();
        return ResponseEntity.ok("All Elasticsearch documents deleted");
    }
}
