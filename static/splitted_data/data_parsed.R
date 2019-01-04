data_eco <- read.csv("/home/hermes/Téléchargements/NFA 2018 Edition.csv", header = TRUE)
data_eco_selected <- data_eco[data_eco$record %in% c("EFConsPerCap", "EFConsTotGHA"),]
world <- data_eco[data_eco$country %in% c("World") & data_eco$record %in% c("BiocapTotGHA"), ]
data_world <- data_eco_selected[data_eco_selected$country == "World",]
data_world$population <- ave(data_world$total, data_world$country, data_world$year, FUN = function(x) x[2]/x[1])
world_data <- unique(data_world[,c(2,13)])

data_with_world_pop <- merge(data_eco_selected, world_data, by.x = "year", by.y = "year")

reduced_data <- data_with_world_pop[data_with_world_pop$record %in% c("EFConsPerCap"),]

reduced_data <- reduced_data[order(reduced_data$country_code),]

recuded_data_1 <- reduced_data[,c(1,2,11,13)]

countries <- read.csv("/home/hermes/Téléchargements/GFN Country code concordance table.csv", header = TRUE)

tot_data <- merge(tot_data, countries[,c(2,4)], by.x = "country_code", by.y = "GFN.Country.Code")

tot_data_order <- tot_data[order(tot_data$country_code, tot_data$year),]

setwd("/home/hermes/Bureau/S3/DataViz/Projet")
for (i in unique(tot_data_order$country)) {
  country <- tot_data_order[tot_data_order$country %in% c(i),c(2,3,7,8)]
  write.csv(country, file = paste(i, ".csv", sep = ""), row.names = FALSE)
}

