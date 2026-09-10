import Papa from "papaparse";

/**
 * Validates and normalizes CSV data based on chosen visualization type
 */
export const validateAndParseCSV = (buffer, chartType) => {
  return new Promise((resolve, reject) => {
    const csvString = buffer.toString("utf-8");

    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      complete: (results) => {
        const { data, meta } = results;

        if (!data || data.length === 0) {
          return reject(new Error("Uploaded CSV file is empty"));
        }

        const headers = meta.fields || Object.keys(data[0]);

        // Schema validation by chartType
        try {
          const validated = validateSchema(data, headers, chartType);
          resolve(validated);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};

const validateSchema = (data, headers, chartType) => {
  switch (chartType) {
    case "lat_long_map": {
      // Must contain Latitude and Longitude columns
      const latKey = headers.find((h) => /^lat(itude)?$/i.test(h));
      const lngKey = headers.find((h) => /^(lon(gitude)?|lng)$/i.test(h));

      if (!latKey || !lngKey) {
        throw new Error(
          "Latitude/Longitude data must contain 'Latitude' (or 'lat') and 'Longitude' (or 'lng') columns.",
        );
      }

      // Check numeric bounds
      const sanitized = data.map((row, index) => {
        const lat = parseFloat(row[latKey]);
        const lng = parseFloat(row[lngKey]);

        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error(
            `Row ${index + 1}: Invalid Latitude value '${row[latKey]}'`,
          );
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          throw new Error(
            `Row ${index + 1}: Invalid Longitude value '${row[lngKey]}'`,
          );
        }

        return {
          ...row,
          lat,
          lng,
        };
      });

      return { columns: headers, data: sanitized };
    }

    case "state_heatmap": {
      // Must contain State and Value columns
      const stateKey = headers.find((h) =>
        /^(state|region|state_name|st_nm)$/i.test(h),
      );
      const valueKey =
        headers.find((h) =>
          /^(value|val|capacity|generation|temp|metric)$/i.test(h),
        ) || headers.find((h) => h !== stateKey);

      if (!stateKey || !valueKey) {
        throw new Error(
          "State-wise data must contain a 'State' column and a numeric 'Value' column.",
        );
      }

      const sanitized = data.map((row, index) => {
        const state = String(row[stateKey]).trim();
        const value = parseFloat(row[valueKey]);

        if (!state) {
          throw new Error(`Row ${index + 1}: Missing State name`);
        }
        if (isNaN(value)) {
          throw new Error(
            `Row ${index + 1}: Value '${row[valueKey]}' is not a valid number`,
          );
        }

        return {
          ...row,
          state,
          value,
        };
      });

      return { columns: headers, data: sanitized };
    }

    case "line":
    case "bar":
    case "area": {
      // Time-series: must contain Date/Year and at least one numeric metric
      const dateKey = headers.find((h) =>
        /^(date|year|month|period|time)$/i.test(h),
      );

      if (!dateKey) {
        throw new Error(
          "Time-series data must contain a 'Date' or 'Year' column.",
        );
      }

      const metricKeys = headers.filter((h) => h !== dateKey);
      if (metricKeys.length === 0) {
        throw new Error(
          "Time-series data must contain at least one numeric metric column.",
        );
      }

      const sanitized = data.map((row, index) => {
        const entry = { ...row, [dateKey]: String(row[dateKey]).trim() };

        metricKeys.forEach((key) => {
          const num = parseFloat(row[key]);
          if (isNaN(num)) {
            throw new Error(
              `Row ${index + 1}: Metric '${key}' has invalid numeric value '${row[key]}'`,
            );
          }
          entry[key] = num;
        });

        return entry;
      });

      return { columns: headers, data: sanitized };
    }

    default:
      throw new Error(`Unsupported chart type: ${chartType}`);
  }
};
