package com.restaurant.restaurant_service.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

@Document(indexName = "menu_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDocument {

        @Id
        private String id;

        @MultiField(mainField = @Field(type = FieldType.Text, analyzer = "standard"), otherFields = {
                        @InnerField(suffix = "keyword", type = FieldType.Keyword)
        })
        private String name;

        @Field(type = FieldType.Text, analyzer = "standard")
        private String description;

        @Field(type = FieldType.Double)
        private Double price;

        @Field(type = FieldType.Boolean)
        private boolean isVeg;

        @Field(type = FieldType.Boolean)
        private boolean isAvailable;

        @Field(type = FieldType.Keyword)
        private String restaurantId;

        @Field(type = FieldType.Keyword)
        private String categoryId;

        @Field(type = FieldType.Keyword)
        private String productImage;

        @Field(type = FieldType.Text)
        private String restaurantName;

        @Field(type = FieldType.Text)
        private String category;
}
