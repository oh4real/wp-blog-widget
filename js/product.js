
/**
 * 
 * Usage examples:
 * `typeof TaggedPosts != 'undefined' ? (new TaggedPosts()).assemblePosts('elite checking') : console.log('include product.js');`
 * -- or --
 * `typeof TaggedPosts != 'undefined' ? (new TaggedPosts(url, pathToBlogHtml, postsPerPage)).assemblePosts('elite checking') : console.log('include product.js');`
 * 
 * @param {*} blogUrl 
 * @param {*} blogLocation 
 * @param {*} postsPerPage 
 */
TaggedPosts = function (blogUrl, blogLocation, postsPerPage) {
    this.blogURL = blogUrl || 'https://alpinebank.wpengine.com';
    this.blogLocation = blogLocation || 'about-us/blog';
    this.postsPerPage = postsPerPage || 10;
}

TaggedPosts.prototype.assemblePosts = function(productTag) {
    var self = this;
    jQuery.ajax({
        url: this.blogURL + '/wp-json/wp/v2/tags',
        crossDomain: true
    }).done(function (tags) {
        var featuredPostsReq = self.requestPostsFromTag(tags, 1, 'featured');
        var productPostsReq = self.requestPostsFromTag(tags, self.postsPerPage, productTag || 'promo'); // thinking promo = the cross promotional
        var relatedPostsReq = self.requestPostsFromTag(tags, 3, 'related');
        var otherPostsReq = self.requestPostsFromTag(tags, 10, 'hooplah'); // will return empty array []
        // add more as needed

        jQuery.when(featuredPostsReq, productPostsReq, relatedPostsReq, otherPostsReq)
            .then(function (featuredPostsResponse, productPostsResponse, relatedPostsResponse, otherPostsResponse) {
                console.log(
                    featuredPostsResponse, 
                    productPostsResponse, 
                    relatedPostsResponse, 
                    otherPostsResponse
                );
                var compiledPosts = featuredPostsResponse.data.concat(
                    productPostsResponse.data, 
                    relatedPostsResponse.data, 
                    otherPostsResponse.data // in this example none
                );
                console.log(compiledPosts)
                
                // call global method to inject/render into element. e.g. renderFeaturedPosts(compiledPosts)
                // buildCategoryPage is an example for product.html
                buildCategoryPage(self.removeDuplicates(compiledPosts));
            });
    });
}

TaggedPosts.prototype.findTagId = function (tags, tagName) {
    var tagId;
    tags.forEach(function (tag) {
        if (tag.name == tagName) {
            tagId = tag.id;
        }
    });
    return tagId;
}

TaggedPosts.prototype.requestPostsFromTag = function (tags, count, tagName) {
    var self = this;
    return jQuery.ajax({
        url: self.blogURL + '/wp-json/wp/v2/posts',
        data: {
            _embed: true,
            per_page: count,
            tags: self.findTagId(tags, tagName) || -1 // this will return an empty array
        },
        crossDomain: true
    }).then(function(data) {
        // don't return [data, status, xhr], return just what we need
        return {
            data: data
        }
    });
}

TaggedPosts.prototype.removeDuplicates = function(arr) {
    var inputArr = arr.map(function(item) {
        return JSON.stringify(item);
    });

    //  source: http://locutus.io/php/array_unique/
    var key = ''
    var tmpArr2 = []
    var val = ''
    var _arraySearch = function (needle, haystack) {
        var fkey = ''
        for (fkey in haystack) {
            if (haystack.hasOwnProperty(fkey)) {
                if ((haystack[fkey] + '') === (needle + '')) {
                    return fkey
                }
            }
        }
        return false
    }
    for (key in inputArr) {
        if (inputArr.hasOwnProperty(key)) {
            val = inputArr[key]
            if (_arraySearch(val, tmpArr2) === false) {
                tmpArr2[key] = val
            }
        }
    }

    var list =[];
    tmpArr2.map(function(item) {
        list.push(JSON.parse(item));
    });
    return list;

}