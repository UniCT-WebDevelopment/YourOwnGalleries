<?php

const BASE_STORAGE = 10737418240; // Base storage space in bytes
const GB_BASE_STORAGE = 10; // Base storage in GB

return [
    'forbiddenEmails' => [env('MAIL_USERNAME')],
    'forbiddenNames' => ['me', 'deleted user', '?'],
    'newsMaxSize' => 8,
    'itemsPageSize' => 24,
    'galleriesPageSize' => 30,
    'mimes' => ['video' => ['video/mp4'], 'image' => ['image/jpeg']],
    'mimesExtensions' => ['video/mp4' => '.mp4', 'image/jpeg' => '.jpg'],
    'restorePasswordEmail' => "Dear %s,\n\nyour password has been rigenerated,\ndon't forget to change it as soon as possible inside the app!\nYour new password: %s\n\n\nRegards,\nYourOwnGalleries Staff",
    'storages' =>
    [
        'base' => ['size' => BASE_STORAGE, 'description' => 'Free ' . GB_BASE_STORAGE . ' GB plan'],
        'advanced' => ['size' => 1.5 * BASE_STORAGE, 'description' => 1.5 * GB_BASE_STORAGE . ' GB medium plan'],
        'pro' => ['size' =>  2.5 * BASE_STORAGE, 'description' => 2.5 * GB_BASE_STORAGE . ' GB large plan'],
        'unbelievable' => ['size' => 5 * BASE_STORAGE, 'description' => 5 * GB_BASE_STORAGE . ' GB unbeatable plan']
    ],
    'thumbsExtension' => '.jpg',
];
