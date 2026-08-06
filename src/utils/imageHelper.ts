export const getProductPlaceholderImage = (productName: string, category?: string): string => {
  const name = productName.toLowerCase();
  const cat = category ? category.toLowerCase() : "";

  if (name.includes("black forest")) {
    return "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("red velvet")) {
    return "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("chocolate cake") || name.includes("truffle cake") || name.includes("belgian chocolate")) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("vanilla cake") || name.includes("vanilla")) {
    return "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("fruit cake") || name.includes("strawberry cream cake") || name.includes("berry cake") || name.includes("fruit")) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("butterscotch cake") || name.includes("caramel cake") || name.includes("butterscotch")) {
    return "https://images.unsplash.com/photo-1557925923-cd4648e21187?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("truffle") || name.includes("truffles")) {
    return "https://images.unsplash.com/photo-1544967082-d9d25dca7cbd?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("gift box") || name.includes("chocolate box") || name.includes("assorted box")) {
    return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&auto=format&fit=crop&q=80";
  }
  if (name.includes("chocolate") || name.includes("brownie") || name.includes("cookie")) {
    return "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&auto=format&fit=crop&q=80";
  }

  // Fallback category-based placeholders
  if (cat.includes("saree") || name.includes("saree") || name.includes("kanjeevaram") || name.includes("banarasi")) {
    return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80";
  }
  if (cat.includes("kurti") || name.includes("kurti") || name.includes("kurta") || name.includes("wear")) {
    return "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&auto=format&fit=crop&q=80";
  }
  if (cat.includes("jewel") || name.includes("jhumka") || name.includes("earring") || name.includes("necklace")) {
    return "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=80";
  }
  if (cat.includes("bag") || name.includes("clutch") || name.includes("bag") || name.includes("tote")) {
    return "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80";
  }
  if (cat.includes("hair") || name.includes("styling") || name.includes("cut") || name.includes("treatment")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80";
  }
  if (cat.includes("skin") || name.includes("facial") || name.includes("makeup")) {
    return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80";
  }

  // Default bakery placeholder (cupcake)
  if (cat.includes("cake") || cat.includes("bakery") || cat.includes("pastr") || cat.includes("cookie")) {
    return "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&auto=format&fit=crop&q=80";
  }

  // General default fallback
  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80";
};

export const getProductImageUrl = (imageUrl?: string, productName: string = "", category: string = ""): string => {
  if (!imageUrl) {
    return getProductPlaceholderImage(productName, category);
  }
  if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
    return imageUrl;
  }
  
  const key = imageUrl.toLowerCase();
  
  // Bakery key matches
  if (key === "cake_truffle") return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80";
  if (key === "cake_strawberry") return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80";
  if (key === "cake_cheese") return "https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=400&auto=format&fit=crop&q=80";
  if (key === "cake_redvelvet") return "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400&auto=format&fit=crop&q=80";
  if (key === "bake_macaron") return "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&auto=format&fit=crop&q=80";
  if (key === "bake_cupcake") return "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&auto=format&fit=crop&q=80";
  if (key === "bake_croissant") return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80";
  if (key === "bake_brownie") return "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80";
  if (key === "bread_sourdough") return "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop&q=80";
  if (key === "bread_focaccia") return "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&auto=format&fit=crop&q=80";
  if (key === "bread_wheat") return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80";
  if (key === "bread_brioche") return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80";
  if (key === "cookie_choco") return "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&auto=format&fit=crop&q=80";
  if (key === "cookie_oat") return "https://images.unsplash.com/photo-1558961317-5f255afb0390?w=400&auto=format&fit=crop&q=80";
  if (key === "cookie_macadamia") return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80";
  if (key === "cookie_biscotti") return "https://images.unsplash.com/photo-1557925923-cd4648e21187?w=400&auto=format&fit=crop&q=80";

  // Boutique key matches
  if (key.startsWith("saree_pink")) return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("saree_emerald")) return "https://images.unsplash.com/photo-1610030469504-206e1dc285e6?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("saree_mustard")) return "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("saree_crimson")) return "https://images.unsplash.com/photo-1583391265517-35bbdba01229?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("saree_lavender")) return "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("saree_indigo")) return "https://images.unsplash.com/photo-1583391265517-35bbdba01229?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("kurti_")) return "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("jewel_")) return "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("bag_")) return "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80";

  // Salon key matches
  if (key.startsWith("salon_color")) return "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_keratin")) return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_cut")) return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_facial")) return "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_cleanse")) return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_nail")) return "https://images.unsplash.com/photo-1604654894610-df490c81137a?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_manipedi")) return "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("salon_bridal") || key.startsWith("salon_party")) return "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=80";
  if (key.startsWith("retail_")) return "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80";

  return getProductPlaceholderImage(productName, category);
};
