import './style.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import _ from 'lodash';
import angular from 'angular';

const app = angular.module('sampleBlogApp', [])
    .controller('sampleBlogAppCtrl', ['$scope', 'PostService', 'UserFactory', function ($scope, PostService, UserFactory) {
        PostService.getAll().then(function (postsList) {
            $scope.users = [];
            if (!postsList) {
                return;
            }
            getUniqueUserIds(postsList);
            _.forEach($scope.userIds, (id) => {
                $scope.users.push(new UserFactory(id, postsList));
            });
            $scope.currentUser = $scope.users[0];
            $scope.currentPost = $scope.users[0].posts[0];
        }, function (e) {
            console.error(e);
        });

        $scope.onUserClick = function (user) {
            $scope.currentUser = user;
        };

        $scope.onPostClick = function (post) {
            $scope.currentPost = post;
        };

        function getUniqueUserIds(postsList) {
            $scope.userIds = _.uniq(_.map(postsList, 'userId'));
        }

    }])
    .service('PostService', ['$q', 'BaseService', 'PostFactory',
        function ($q, BaseService, PostFactory) {
            let posts = [];

            this.getAll = function() {
                let deferred = $q.defer();

                BaseService.get('posts').then((data) => {
                    _.forEach(data, (post) => {
                        posts.push(new PostFactory(post));
                    });
                    deferred.resolve(posts);
                }, function (data) {
                    deferred.reject(data);
                });

                return deferred.promise;
            };

        }])
    .service('BaseService', ['$q', '$http',
        function ($q, $http) {
            let baseUrl = 'http://jsonplaceholder.typicode.com/';

            this.get = (url) => {
                let deferred = $q.defer();

                $http.get(baseUrl + url).then((data) => {
                    if (data === undefined
                        || data === null
                        || data.status !== 200
                        || data.data === undefined
                        || data.data === null ) {
                        deferred.reject(data);
                    }
                    deferred.resolve(data.data);
                }, (data) => {
                    deferred.reject(data);
                });

                return deferred.promise;
            };

        }])
    .factory('PostFactory', [function () {
        class PostFactory {
            constructor(object) {
                this.id = object.id;
                this.userId = object.userId;
                this.title = object.title;
                this.body = object.body;
            }
        }

        return PostFactory;
    }])
    .factory('UserFactory', [function () {
        class UserFactory {
            constructor(id, postsList) {
                this.id = id;
                this.posts = _.filter(postsList, {userId: id});
            }

            showUserName() {
                return "User " + this.id;
            }
        }

        return UserFactory;
    }])
;