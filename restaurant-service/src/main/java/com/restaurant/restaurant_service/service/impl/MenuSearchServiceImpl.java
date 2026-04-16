package com.restaurant.restaurant_service.service.impl;

import com.restaurant.restaurant_service.dto.MenuSearchRequest;
import com.restaurant.restaurant_service.entity.MenuItemDocument;
import com.restaurant.restaurant_service.service.MenuSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuSearchServiceImpl implements MenuSearchService {

    private final ElasticsearchOperations elasticsearchOperations;

    @Override
    public Page<MenuItemDocument> search(MenuSearchRequest request) {

        Pageable pageable = PageRequest.of(request.page(), request.size());

        var queryBuilder = org.springframework.data.elasticsearch.client.elc.NativeQuery.builder()
                .withPageable(pageable)
                .withQuery(q -> q.bool(b -> {

                    // Only available items
                    b.must(m -> m.term(t -> t.field("isAvailable").value(true)));

                    if (request.search() != null && !request.search().isBlank()) {
                        b.must(m -> m.multiMatch(mm -> mm
                                .query(request.search())
                                .fields("name", "description")
                                .fuzziness("AUTO")
                        ));
                    }

                    if (request.veg() != null) {
                        b.filter(f -> f.term(t -> t.field("isVeg").value(request.veg())));
                    }

                    if (request.categoryId() != null) {
                        b.filter(f -> f.term(t -> t
                                .field("categoryId.keyword")
                                .value(request.categoryId())));
                    }

                    if (request.minPrice() != null && request.maxPrice() != null) {
                        b.filter(f -> f.range(r -> r
                                .number(n -> n
                                        .field("price")
                                        .gte(request.minPrice().doubleValue())
                                        .lte(request.maxPrice().doubleValue())
                                )
                        ));
                    }

                    return b;
                }))
                .build();

        SearchHits<MenuItemDocument> hits =
                elasticsearchOperations.search(queryBuilder, MenuItemDocument.class);

        List<MenuItemDocument> content = hits.getSearchHits()
                .stream()
                .map(SearchHit::getContent)
                .toList();

        return new PageImpl<>(content, pageable, hits.getTotalHits());
    }

}
