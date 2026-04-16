package com.restaurant.restaurant_service.repository.search;

import com.restaurant.restaurant_service.entity.MenuItemDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@EnableElasticsearchRepositories
public interface MenuItemSearchRepository
        extends ElasticsearchRepository<MenuItemDocument, String> {
}
